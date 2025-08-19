package logic

import (
	"context"

	"Server_gozero/CS/commodityServer/rpc/commodity"
	"Server_gozero/CS/commodityServer/rpc/internal/svc"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetLandLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewGetLandLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetLandLogic {
	return &GetLandLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

func (l *GetLandLogic) GetLand(in *commodity.GetLandRepReq) (*commodity.GetLandRepResp, error) {
	// todo: add your logic here and delete this line

	one, err := l.svcCtx.LandModel.FindOne(l.ctx, in.LandID)
	if err != nil {
		return nil, err
	}
	return &commodity.GetLandRepResp{SaleStatus: one.SaleStatus}, nil
}
