package userCenter

import (
	"context"
	"errors"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetAdminLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetAdminLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetAdminLogic {
	return &GetAdminLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetAdminLogic) GetAdmin(req *types.GetAdminInfoRequest) (resp *types.GetAdminInfoResponse, err error) {
	// todo: add your logic here and delete this line
	u, err := l.svcCtx.AdminModel.FindOneByID(l.ctx, int64(req.AdminID))
	if err != nil {
		logx.Errorw("l.getJwtToken failed", logx.Field("err", err))
		return nil, errors.New("内部错误")
	}
	return &types.GetAdminInfoResponse{
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
	}, nil

}
