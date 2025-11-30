package coupon

import (
	"context"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetCouponThreeLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetCouponThreeLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetCouponThreeLogic {
	return &GetCouponThreeLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetCouponThreeLogic) GetCouponThree(req *types.GetCouponThreeRequest) (resp *types.GetCouponThreeResponse, err error) {
	// todo: add your logic here and delete this line

	return
}
