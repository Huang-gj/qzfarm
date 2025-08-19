package GoodOrder

import (
	"context"
	"errors"

	"Server_gozero/CS/orderServer/api/internal/svc"
	"Server_gozero/CS/orderServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetGoodOrderByStatusLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetGoodOrderByStatusLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetGoodOrderByStatusLogic {
	return &GetGoodOrderByStatusLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetGoodOrderByStatusLogic) GetGoodOrderByStatus(req *types.GetGoodOrderByStatusRequest) (resp *types.GetGoodOrderByStatusResponse, err error) {
	// todo: add your logic here and delete this line

	Orders, err := l.svcCtx.GoodOrder.FindOneByUidAndStatus(l.ctx, int64(req.UserID), req.OrderStatus)
	if err != nil {
		logx.Errorw("GetOrderByStatus failed", logx.Field("err", err))
		return &types.GetGoodOrderByStatusResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	orders := make([]*types.GoodOrder, len(Orders))
	for i, order := range Orders {
		orders[i] = &types.GoodOrder{
			Id:          order.Id,
			DelState:    order.DelState,
			DelTime:     order.DelTime.Format("2006-01-02 15:04:05"),
			CreateTime:  order.CreateTime.Format("2006-01-02 15:04:05"),
			GoodOrderId: order.GoodOrderId,
			ImageUrls:   order.ImageUrls.String,
			GoodId:      order.GoodId,
			FarmId:      order.FarmId,
			UserId:      order.UserId,
			UserAddress: order.UserAddress,
			FarmAddress: order.FarmAddress,
			Price:       order.Price,
			Units:       order.Units,
			Count:       order.Count,
			Detail:      order.Detail.String,
			OrderStatus: order.OrderStatus,
		}
	}
	resp = &types.GetGoodOrderByStatusResponse{
		Code:       200,
		Msg:        "查找成功",
		Good_order: orders,
	}
	return resp, nil
}
