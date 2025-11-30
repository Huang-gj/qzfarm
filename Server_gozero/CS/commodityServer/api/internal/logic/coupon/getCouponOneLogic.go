package coupon

import (
	"context"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetCouponOneLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetCouponOneLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetCouponOneLogic {
	return &GetCouponOneLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetCouponOneLogic) GetCouponOne(req *types.GetCouponOneRequest) (resp *types.GetCouponOneResponse, err error) {
	// todo: add your logic here and delete this line

	return
}
