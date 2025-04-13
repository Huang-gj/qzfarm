package user

import (
	"gorm.io/datatypes"
	"time"
)

type UserInfo struct {
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
	DelState        int            `gorm:"default:0" json:"del_state"`
	DelTime         time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"del_time"`
	CreateTime      time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"create_time"`
}
