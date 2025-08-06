package userCenter

import (
	"context"
	"errors"

	"Server_gozero/BS/api/internal/common"
	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdatePhoneNumberLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdatePhoneNumberLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdatePhoneNumberLogic {
	return &UpdatePhoneNumberLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdatePhoneNumberLogic) UpdatePhoneNumber(req *types.UpdatePhoneNumberRequest) (resp *types.UpdatePhoneNumberResponse, err error) {
	// todo: add your logic here and delete this line
	u, err := l.svcCtx.AdminModel.FindOneByID(l.ctx, int64(req.AdminID))
	if err != nil {
		logx.Errorw("UpdatePass FindOneByID failed", logx.Field("err", err))
		return nil, errors.New("内部错误")
	}
	if u.Password != common.PasswordMd5([]byte(req.Password)) {
		return &types.UpdatePhoneNumberResponse{
			Code: 400,
			Msg:  "密码错误！",
		}, nil
	}
	err = l.svcCtx.AdminModel.UpdatePhoneNumber(l.ctx, int64(req.AdminID), req.PhoneNumber)
	if err != nil {
		logx.Errorw("UpdatePass failed", logx.Field("err", err))
		return nil, errors.New("内部错误")
	}
	return &types.UpdatePhoneNumberResponse{
		Code: 200,
		Msg:  "修改密码成功",
	}, nil
}
