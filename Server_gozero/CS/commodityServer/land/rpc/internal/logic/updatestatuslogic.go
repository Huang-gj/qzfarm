package logic

import (
	"context"

	"Server_gozero/CS/commodityServer/land/rpc/internal/svc"
	"Server_gozero/CS/commodityServer/land/rpc/land"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateStatusLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewUpdateStatusLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateStatusLogic {
	return &UpdateStatusLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

func (l *UpdateStatusLogic) UpdateStatus(in *land.UpdateStatusReq) (*land.UpdateStatusResp, error) {
	// todo: add your logic here and delete this line
	err := l.svcCtx.LandModel.UpdateStatus(l.ctx, in.LandID, in.SaleStatus)
	if err != nil {
		return nil, err
	}
	return &land.UpdateStatusResp{}, nil
}
