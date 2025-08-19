package userCenter

import (
	"Server_gozero/BS/model/AdminModel"
	"context"
	"errors"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateAdminLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateAdminLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateAdminLogic {
	return &UpdateAdminLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdateAdminLogic) UpdateAdmin(req *types.UpdateAdminRequest) (resp *types.UpdateAdminResponse, err error) {
	// todo: add your logic here and delete this line

	err = l.svcCtx.AdminModel.Update(l.ctx, &AdminModel.Admin{
		AdminId: int64(req.AdminID),

		Nickname: req.NickName,
		QqEmail:  req.QQEmail,
		Gender:   int64(req.Gender),
	})
	if err != nil {
		logx.Errorw("BS UpdateAdmin failed", logx.Field("err", err))
		return nil, errors.New("内部错误")
	}

	return &types.UpdateAdminResponse{
		Code: 200,
		Msg:  "修改信息成功",
	}, nil
}
