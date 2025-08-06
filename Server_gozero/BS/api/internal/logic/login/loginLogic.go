package login

import (
	"context"
	"errors"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"

	"Server_gozero/BS/api/internal/common"
	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type LoginLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// login
func NewLoginLogic(ctx context.Context, svcCtx *svc.ServiceContext) *LoginLogic {
	return &LoginLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *LoginLogic) Login(req *types.LoginRequest) (resp *types.LoginResponse, err error) {
	// todo: add your logic here and delete this line
	u, err := l.svcCtx.AdminModel.FindOneByPhoneNumber(l.ctx, req.PhoneNumber)
	if err == sqlx.ErrNotFound {
		return &types.LoginResponse{
			Code: 400,
			Msg:  "用户名不存在",
		}, nil
	}
	if err != nil {
		logx.Errorw("BS.FindOne failed", logx.Field("err", err))
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
	token, err := common.GetJwtToken(l.svcCtx.Config.Auth.AccessSecret, now, expire, u.AdminId)
	if err != nil {
		logx.Errorw("l.getJwtToken failed", logx.Field("err", err))
		return nil, errors.New("内部错误")
	}
	return &types.LoginResponse{
		Code: 200,
		Msg:  "登录成功",
		Admin: types.Admin{
			AdminID:     int(u.AdminId),
			PhoneNumber: u.PhoneNumber,
			Avatar:      u.Avatar,
			NickName:    u.Nickname,
			QQEmail:     u.QqEmail,
			Gender:      int(u.Gender),
			FarmID:      int(u.FarmId),
		},
		AccessToken:  token,
		AccessExpire: int(now + expire),
		RefreshAfter: int(now + expire/2),
	}, nil

}
