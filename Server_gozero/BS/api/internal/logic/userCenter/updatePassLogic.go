package userCenter

import (
	"context"
	"errors"

	"Server_gozero/BS/api/internal/common"
	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdatePassLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdatePassLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdatePassLogic {
	return &UpdatePassLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdatePassLogic) UpdatePass(req *types.UpdatePassRequest) (resp *types.UpdatePassResponse, err error) {
	// todo: add your logic here and delete this line
	err = l.svcCtx.AdminModel.UpdatePassword(l.ctx, int64(req.AdminID), common.PasswordMd5([]byte(req.Password)))
	if err != nil {
		logx.Errorw("UpdatePass failed", logx.Field("err", err))
		return nil, errors.New("内部错误")
	}
	return &types.UpdatePassResponse{
		Code: 200,
		Msg:  "修改密码成功",
	}, nil

}
