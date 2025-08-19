package logic

import (
	"Server_gozero/common"
	"context"
	"errors"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"

	"api/internal/svc"
	"api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type LoginLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewLoginLogic(ctx context.Context, svcCtx *svc.ServiceContext) *LoginLogic {
	return &LoginLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *LoginLogic) Login(req *types.LoginRequest) (resp *types.LoginResponse, err error) {
	// todo: add your logic here and delete this line
	u, err := l.svcCtx.UserModel.FindOneByPhoneNumber(l.ctx, req.PhoneNumber)
	if err == sqlx.ErrNotFound {
		return &types.LoginResponse{
			Code: 400,
			Msg:  "用户名不存在",
		}, nil
	}
	if err != nil {
		logx.Errorw("UserModel.FindOneByUsername failed", logx.Field("err", err))
		return nil, errors.New("内部错误")
	}
	if u.Password != common.PasswordMd5([]byte(req.Password)) {
		return &types.LoginResponse{
			Code: 400,
			Msg:  "用户名或密码错误",
		}, nil
	}
	now := time.Now().Unix()
	expire := l.svcCtx.Config.Auth.AccessExpire
	token, err := common.GetJwtToken(l.svcCtx.Config.Auth.AccessSecret, now, expire, u.UserId)
	if err != nil {
		logx.Errorw("l.getJwtToken failed", logx.Field("err", err))
		return nil, errors.New("内部错误")
	}
	return &types.LoginResponse{
		Code: 200,
		Msg:  "登录成功",
		Userinfo: types.UserInfo{
			UserID:      int(u.UserId),
			PhoneNumber: u.PhoneNumber,
			Avatar:      u.Avatar,
			NickName:    u.Nickname,
			Address:     u.Address,
			Gender:      int(u.Gender),
		},
		AccessToken:  token,
		AccessExpire: int(now + expire),
		RefreshAfter: int(now + expire/2),
	}, nil
}
