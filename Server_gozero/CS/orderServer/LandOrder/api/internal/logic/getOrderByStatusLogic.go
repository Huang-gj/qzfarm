package logic

import (
	"context"
	"errors"

	"Server_gozero/CS/orderServer/LandOrder/api/internal/svc"
	"Server_gozero/CS/orderServer/LandOrder/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetOrderByStatusLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetOrderByStatusLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetOrderByStatusLogic {
	return &GetOrderByStatusLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetOrderByStatusLogic) GetOrderByStatus(req *types.GetOrderByStatusRequest) (resp *types.GetOrderByStatusResponse, err error) {
	// todo: add your logic here and delete this line
	Orders, err := l.svcCtx.LandOrder.FindOneByUidAndStatus(l.ctx, int64(req.UserID), req.OrderStatus)
	if err != nil {
		logx.Errorw("GetOrderByStatus failed", logx.Field("err", err))
		return &types.GetOrderByStatusResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	orders := make([]*types.LandOrder, len(Orders))
	for i, order := range Orders {
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
	resp = &types.GetOrderByStatusResponse{
		Code:       200,
		Msg:        "查找成功",
		Land_order: orders,
	}
	return resp, nil
}
