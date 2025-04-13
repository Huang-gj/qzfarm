package model

import (
	"crypto/md5"
	"encoding/hex"
	"errors"
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type (
	UserModel interface {
		Insert(user UserInfo) (err error)
		SelectByID(account string) (UserInfo, error, int64)
		DelSoft(id int) (err error)
		Del(id int) (err error)
		SelectByAccount(account string) (user UserInfo, err error)
		Update(user UserInfo) (err error)
		ValidatePassword(user UserInfo, acc string) bool
	}

	DefaultUserModel struct {
		conn  *gorm.DB
		table string
	}

	UserInfo struct {
		UserID          int            `gorm:"primaryKey;autoIncrement" json:"user_id"`          // 用户ID
		UserAccount     string         `gorm:"size:128" json:"user_account"`                     // 用户账号
		UserPasswd      string         `gorm:"size:128" json:"user_passwd"`                      // 用户密码
		AvatarURL       string         `gorm:"size:512" json:"avatar_url"`                       // 用户头像URL
		NickName        string         `gorm:"size:128" json:"nick_name"`                        // 用户昵称
		PhoneNumber     string         `gorm:"size:20" json:"phone_number"`                      // 用户电话号码
		Gender          int            `json:"gender"`                                           // 用户性别(1=男，2=女)
		IsFarmer        bool           `gorm:"default:false" json:"is_farmer"`                   // 是否为农场用户（农场主）
		FavoriteUnits   datatypes.JSON `gorm:"type:json" json:"favorite_units"`                  // 用户偏好的农场单元，JSON格式
		AdoptedUnits    datatypes.JSON `gorm:"type:json" json:"adopted_units"`                   // 用户认养的农场单元，JSON格式
		FarmVisitCount  int            `gorm:"default:0" json:"farm_visit_count"`                // 用户访问农场的次数
		LastLoginTime   time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"last_login_time"` // 用户最后访问农场的日期
		PreferredFarmID int            `gorm:"default:null" json:"preferred_farm_id"`            // 用户偏好的农场ID
		DelState        int            `gorm:"default:0" json:"del_state"`                       //0为正常 1为删除
		DelTime         time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"del_time"`
		CreateTime      time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"create_time"`
	}
)

// NewDefaultUserModel 创建新的UserModel实例
func NewDefaultUserModel(conn *gorm.DB) UserModel {
	return &DefaultUserModel{
		conn:  conn,
		table: "user_info",
	}
}

// Insert 插入新用户
func (u *DefaultUserModel) Insert(user UserInfo) (err error) {
	user.CreateTime = time.Now()
	//存入时使用 md5加密
	hasher := md5.New()
	hasher.Write([]byte(user.UserPasswd))
	hashedPassword := hasher.Sum(nil)
	user.UserPasswd = hex.EncodeToString(hashedPassword)
	err = u.conn.Create(&user).Error
	return err
}

// SelectByAccount 根据账号名称返回整个账号
func (u *DefaultUserModel) SelectByAccount(account string) (user UserInfo, err error) {
	err = u.conn.Where("user_account = ? AND del_state = 0", account).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return UserInfo{}, errors.New("账号不存在")
		}
		return UserInfo{}, err
	}
	return user, nil
}

// SelectByID 根据ID查询用户
func (u *DefaultUserModel) SelectByID(id string) (user UserInfo, err error, count int64) {
	err = u.conn.Where("user_id = ? AND del_state = 0", id).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return UserInfo{}, errors.New("用户不存在"), 0
		}
		return UserInfo{}, err, 0
	}
	return user, nil, 1
}

// DelSoft 软删除用户
func (u *DefaultUserModel) DelSoft(id int) (err error) {
	updates := map[string]interface{}{
		"del_state": 1,
		"del_time":  time.Now(),
	}
	result := u.conn.Model(&UserInfo{}).Where("user_id = ?", id).Updates(updates)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("用户不存在")
	}
	return nil
}

// Del 硬删除用户
func (u *DefaultUserModel) Del(id int) (err error) {
	result := u.conn.Where("user_id = ?", id).Delete(&UserInfo{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("用户不存在")
	}
	return nil
}

// Update 更新用户信息
func (u *DefaultUserModel) Update(user UserInfo) (err error) {
	result := u.conn.Model(&UserInfo{}).Where("user_id = ? AND del_state = 0", user.UserID).Updates(user)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("用户不存在")
	}
	return nil
}

// ValidatePassword 用于验证用户输入的密码是否与存储的密码一致
func (u *DefaultUserModel) ValidatePassword(user UserInfo, acc string) bool {

	hasher := md5.New()
	hasher.Write([]byte(acc))
	hashedPassword := hasher.Sum(nil)

	encryptedInputPassword := hex.EncodeToString(hashedPassword)

	if encryptedInputPassword != user.UserPasswd {
		// 密码不匹配
		return false
	}

	// 密码匹配
	return true
}
