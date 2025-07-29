package logic

import (
	"context"

	"Server_gozero/CS/orderServer/LandOrder/api/internal/svc"
	"Server_gozero/CS/orderServer/LandOrder/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type AddLandOrderLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewAddLandOrderLogic(ctx context.Context, svcCtx *svc.ServiceContext) *AddLandOrderLogic {
	return &AddLandOrderLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *AddLandOrderLogic) AddLandOrder(req *types.AddLandOrderRequest) (resp *types.AddLandOrderResponse, err error) {
	// todo: add your logic here and delete this line

	return
}
