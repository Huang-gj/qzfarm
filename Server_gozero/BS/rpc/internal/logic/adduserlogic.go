package logic

import (
	"context"

	"Server_gozero/BS/rpc/BS"
	"Server_gozero/BS/rpc/internal/svc"

	"github.com/zeromicro/go-zero/core/logx"
)

type AddUserLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewAddUserLogic(ctx context.Context, svcCtx *svc.ServiceContext) *AddUserLogic {
	return &AddUserLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

func (l *AddUserLogic) AddUser(in *BS.AddUserReq) (*BS.AddUserResp, error) {
	// todo: add your logic here and delete this line
	err := l.svcCtx.SaleData.UpdateUserCount(l.ctx, in.UserId)
	if err != nil {
		return &BS.AddUserResp{Code: 400, Msg: "修改系统用户使用人数出现问题"}, err
	}

	return &BS.AddUserResp{Code: 200, Msg: "修改系统用户使用人数成功"}, nil
}
