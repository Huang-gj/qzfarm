package GoodOrder

import (
	"context"
	"errors"
	"github.com/zeromicro/go-zero/core/stores/sqlx"

	"Server_gozero/CS/orderServer/api/internal/svc"
	"Server_gozero/CS/orderServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetGoodOrderDetailLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetGoodOrderDetailLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetGoodOrderDetailLogic {
	return &GetGoodOrderDetailLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetGoodOrderDetailLogic) GetGoodOrderDetail(req *types.GetGoodOrderDetailRequest) (resp *types.GetGoodOrderDetailResponse, err error) {
	// todo: add your logic here and delete this line

	// todo: add your logic here and delete this line
	order, err := l.svcCtx.GoodOrder.FindOneByUIDAndOID(l.ctx, int64(req.UserID), int64(req.GoodOrderID))
	if err != nil && !errors.Is(err, sqlx.ErrNotFound) {
		logx.Errorw("GetGoodOrderDetail failed", logx.Field("err", err))
		return &types.GetGoodOrderDetailResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	if err != nil {
		return &types.GetGoodOrderDetailResponse{Code: 400, Msg: "订单不存在"}, errors.New("订单不存在")
	}

	resp = &types.GetGoodOrderDetailResponse{
		Code: 200,
		Msg:  "查找成功",
		Good_order: types.GoodOrder{
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
		},
	}
	return resp, nil
}
