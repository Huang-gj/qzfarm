package LandOrder

import (
	"context"
	"errors"

	"Server_gozero/CS/orderServer/api/internal/svc"
	"Server_gozero/CS/orderServer/api/internal/types"

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

	AllOrders, err := l.svcCtx.LandOrder.FindAll(l.ctx, int64(req.UserID))
	if err != nil {
		logx.Errorw("GetLandOrder failed", logx.Field("err", err))
		return &types.GetLandOrderResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}

	orders := make([]*types.LandOrder, len(AllOrders))
	for i, order := range AllOrders {
		orders[i] = &types.LandOrder{
			Id:          order.Id,
			DelState:    order.DelState,
			DelTime:     order.DelTime.Format("2006-01-02 15:04:05"),
			CreateTime:  order.CreateTime.Format("2006-01-02 15:04:05"),
			LandOrderId: order.LandOrderId,
			ImageUrls:   order.ImageUrls.String,
			LandId:      order.LandId,
			FarmId:      order.FarmId,
			UserId:      order.UserId,

			FarmAddress: order.FarmAddress,
			Price:       order.Price,

			Count:       order.Count,
			Detail:      order.Detail.String,
			OrderStatus: order.OrderStatus,
		}
	}
	resp = &types.GetLandOrderResponse{
		Code:       200,
		Msg:        "查找成功",
		Land_order: orders,
	}
	return resp, nil
}
