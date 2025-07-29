package logic

import (
	"context"

	"Server_gozero/CS/orderServer/LandOrder/api/internal/svc"
	"Server_gozero/CS/orderServer/LandOrder/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetLandOrderLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetLandOrderLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetLandOrderLogic {
	return &GetLandOrderLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetLandOrderLogic) GetLandOrder(req *types.GetLandOrderRequest) (resp *types.GetLandOrderResponse, err error) {
	// todo: add your logic here and delete this line

	return
}
