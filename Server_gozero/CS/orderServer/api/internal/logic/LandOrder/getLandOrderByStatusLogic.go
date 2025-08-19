package LandOrder

import (
	"context"
	"errors"

	"Server_gozero/CS/orderServer/api/internal/svc"
	"Server_gozero/CS/orderServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetLandOrderByStatusLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetLandOrderByStatusLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetLandOrderByStatusLogic {
	return &GetLandOrderByStatusLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetLandOrderByStatusLogic) GetLandOrderByStatus(req *types.GetLandOrderByStatusRequest) (resp *types.GetLandOrderByStatusResponse, err error) {
	// todo: add your logic here and delete this line

	Orders, err := l.svcCtx.LandOrder.FindOneByUidAndStatus(l.ctx, int64(req.UserID), req.OrderStatus)
	if err != nil {
		logx.Errorw("GetOrderByStatus failed", logx.Field("err", err))
		return &types.GetLandOrderByStatusResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
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
	resp = &types.GetLandOrderByStatusResponse{
		Code:       200,
		Msg:        "查找成功",
		Land_order: orders,
	}
	return resp, nil
}
