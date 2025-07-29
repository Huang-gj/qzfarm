package logic

import (
	"context"

	"Server_gozero/CS/orderServer/LandOrder/api/internal/svc"
	"Server_gozero/CS/orderServer/LandOrder/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetLandOrderDetailLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetLandOrderDetailLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetLandOrderDetailLogic {
	return &GetLandOrderDetailLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetLandOrderDetailLogic) GetLandOrderDetail(req *types.GetLandOrderDetailRequest) (resp *types.GetLandOrderDetailResponse, err error) {
	// todo: add your logic here and delete this line

	return
}
