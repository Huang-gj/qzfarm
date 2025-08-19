package userLogic

import (
	"Server/logic"
	model "Server/model/project_interface"
	"Server/response"
	"Server/servers"
	"errors"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
)

// RegisterRequest 注册请求结构体
type RegisterRequest struct {
	UserAccount string `json:"user_account" binding:"required"`
	UserPasswd  string `json:"user_passwd" binding:"required"`
	PhoneNumber string `json:"phone_number" binding:"required"`
	NickName    string `json:"nick_name" binding:"required"`
}

// Register 用户注册处理函数
func Register(ctx *gin.Context) {
	var req RegisterRequest
	// 绑定JSON参数
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, "参数绑定失败", nil)
		return
	}

	// 参数校验
	if err := validateRegisterParams(&req); err != nil {
		response.BadRequest(ctx, err.Error(), nil)
		return
	}

	// 检查用户账号是否已存在
	_, err := servers.Svc.UserModel.SelectByAccount(req.UserAccount)
	if err == nil { // 如果没有错误，说明用户存在
		response.UnprocessableEntity(ctx, "用户账号已存在", nil)
		return
	} else if err.Error() != "账号不存在" { // 如果是其他错误
		response.InternalServerError(ctx, "系统错误，请稍后再试", nil)
		return
	}

	// 创建新用户
	newUser := model.UserInfo{
		UserAccount:    req.UserAccount,
		UserPasswd:     req.UserPasswd, // Insert方法中会进行MD5加密
		PhoneNumber:    req.PhoneNumber,
		NickName:       req.NickName,
		Gender:         1,                    // 默认未设置
		IsFarmer:       false,                // 默认不是农场主
		FavoriteUnits:  datatypes.JSON("[]"), // 空的JSON数组
		AdoptedUnits:   datatypes.JSON("[]"), // 空的JSON数组
		LastLoginTime:  time.Now(),
		FarmVisitCount: 0,
	}

	// 保存用户到数据库
	err = servers.Svc.UserModel.Insert(newUser)
	if err != nil {
		response.InternalServerError(ctx, "注册失败，请稍后再试", nil)
		return
	}

	// 查询新创建的用户信息
	createdUser, err := servers.Svc.UserModel.SelectByAccount(req.UserAccount)
	if err != nil {
		response.InternalServerError(ctx, "注册成功但获取用户信息失败", nil)
		return
	}

	// 返回成功响应
	response.Success(ctx, gin.H{
		"user_id":      createdUser.UserID,
		"user_account": createdUser.UserAccount,
		"nick_name":    createdUser.NickName,
	}, "注册成功")
}

// validateRegisterParams 验证注册参数
func validateRegisterParams(req *RegisterRequest) error {
	// 检查用户账号是否为空
	if strings.TrimSpace(req.UserAccount) == "" {
		return errors.New("用户账号不能为空")
	}

	// 检查用户账号长度
	if len(req.UserAccount) < 3 || len(req.UserAccount) > 128 {
		return errors.New("用户账号长度应为3-128位")
	}

	// 检查用户账号格式（可根据需求定制）
	accountPattern := `^[a-zA-Z0-9_-]+$`
	if matched, _ := regexp.MatchString(accountPattern, req.UserAccount); !matched {
		return errors.New("用户账号只能包含字母、数字、下划线和连字符")
	}

	// 检查密码是否为空
	if strings.TrimSpace(req.UserPasswd) == "" {
		return errors.New("密码不能为空")
	}

	// 检查密码长度
	if len(req.UserPasswd) < 6 || len(req.UserPasswd) > 128 {
		return errors.New("密码长度应为6-128位")
	}

	// 检查手机号是否为空
	if strings.TrimSpace(req.PhoneNumber) == "" {
		return errors.New("手机号不能为空")
	}

	// 检查手机号格式（中国手机号）
	phonePattern := `^1[3-9]\d{9}$`
	if matched, _ := regexp.MatchString(phonePattern, req.PhoneNumber); !matched {
		return errors.New("手机号格式不正确")
	}

	// 检查昵称是否为空
	if strings.TrimSpace(req.NickName) == "" {
		return errors.New("昵称不能为空")
	}

	// 检查昵称长度
	if len(req.NickName) > 128 {
		return errors.New("昵称长度不能超过128个字符")
	}

	return nil
}

// LoginRequest 登录请求结构体
type LoginRequest struct {
	UserAccount string `json:"user_account" binding:"required"`
	UserPasswd  string `json:"user_passwd" binding:"required"`
}

// Login 用户登录处理函数
func Login(ctx *gin.Context) {
	var req LoginRequest
	// 绑定JSON参数
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, "参数绑定失败", nil)
		return
	}

	// 参数基础校验
	if err := validateLoginParams(&req); err != nil {
		response.BadRequest(ctx, err.Error(), nil)
		return
	}

	// 查询用户是否存在
	user, err := servers.Svc.UserModel.SelectByAccount(req.UserAccount)
	if err != nil {
		if err.Error() == "账号不存在" {
			response.UnprocessableEntity(ctx, "用户账号或密码错误", nil)
			return
		}
		response.InternalServerError(ctx, "系统错误，请稍后再试", nil)
		return
	}

	// 验证密码是否正确
	if !servers.Svc.UserModel.ValidatePassword(user, req.UserPasswd) {
		response.UnprocessableEntity(ctx, "用户账号或密码错误", nil)
		return
	}

	// 检查用户状态
	if user.DelState != 0 {
		response.Forbidden(ctx, "账号已被禁用", nil)
		return
	}

	user.LastLoginTime = time.Now()
	//if err := servers.Svc.UserModel.Update(user); err != nil {
	//	// 这里的错误不影响登录，所以只记录日志，不返回错误
	//	// TODO: 添加日志记录
	//}
	// 生成JWT令牌
	token, err := logic.ReleaseToken(user)
	if err != nil {
		response.InternalServerError(ctx, "系统错误，令牌生成失败", nil)
		return
	}

	// 返回成功响应
	response.Success(ctx, gin.H{
		"user_id":      user.UserID,
		"user_account": user.UserAccount,
		"nick_name":    user.NickName,
		"is_farmer":    user.IsFarmer,
		"token":        token,
		"token_type":   "Bearer",
		"expires_in":   7 * 24 * 60 * 60, // 7天的秒数
	}, "登录成功")
}

// validateLoginParams 验证登录参数
func validateLoginParams(req *LoginRequest) error {
	// 检查用户账号是否为空
	if strings.TrimSpace(req.UserAccount) == "" {
		return errors.New("用户账号不能为空")
	}

	// 检查用户账号长度
	if len(req.UserAccount) < 3 || len(req.UserAccount) > 128 {
		return errors.New("用户账号长度不正确")
	}

	// 检查密码是否为空
	if strings.TrimSpace(req.UserPasswd) == "" {
		return errors.New("密码不能为空")
	}

	// 检查密码长度
	if len(req.UserPasswd) < 6 || len(req.UserPasswd) > 128 {
		return errors.New("密码长度不正确")
	}

	return nil
}
