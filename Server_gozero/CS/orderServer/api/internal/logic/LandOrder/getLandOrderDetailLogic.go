package LandOrder

import (
	"context"
	"errors"
	"github.com/zeromicro/go-zero/core/stores/sqlx"

	"Server_gozero/CS/orderServer/api/internal/svc"
	"Server_gozero/CS/orderServer/api/internal/types"

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

	// todo: add your logic here and delete this line
	order, err := l.svcCtx.LandOrder.FindOneByUIDAndOID(l.ctx, int64(req.UserID), int64(req.LandOrderID))
	if err != nil && !errors.Is(err, sqlx.ErrNotFound) {
		logx.Errorw("GetLandOrderDetail failed", logx.Field("err", err))
		return &types.GetLandOrderDetailResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	if err != nil {
		return &types.GetLandOrderDetailResponse{Code: 400, Msg: "订单不存在"}, errors.New("订单不存在")
	}

	resp = &types.GetLandOrderDetailResponse{
		Code: 200,
		Msg:  "查找成功",
		Land_order: types.LandOrder{
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
		},
	}
	return resp, nil
}
