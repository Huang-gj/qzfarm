package logic

import (
	"context"

	"Server_gozero/CS/commodityServer/land/rpc/internal/svc"
	"Server_gozero/CS/commodityServer/land/rpc/land"

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

func (l *GetLandLogic) GetLand(in *land.GetLandRepReq) (*land.GetLandRepResp, error) {
	// todo: add your logic here and delete this line
	one, err := l.svcCtx.LandModel.FindOne(l.ctx, in.LandID)
	if err != nil {
		return nil, err
	}
	return &land.GetLandRepResp{SaleStatus: one.SaleStatus}, nil
}
