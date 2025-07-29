package logic

import (
	"Server_gozero/CS/common/ISender/ISender"

	"Server_gozero/CS/orderServer/LandOrder/model"
	"context"
	"database/sql"
	"errors"
	"time"

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
	OrderID, err := l.svcCtx.Ident.GetId(l.ctx, &ISender.GetIDReq{BizTag: "land_order"})
	if err != nil {
		logx.Errorw("分布式唯一id获取错误！", logx.Field("err", err))
		return &types.AddLandOrderResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	var land_order = &model.LandOrder{
		CreateTime:  time.Now(),
		DelState:    0,
		DelTime:     time.Now(),
		LandOrderId: OrderID,
		ImageUrls:   sql.NullString{String: req.Land_order.ImageUrls, Valid: req.Land_order.ImageUrls != ""},
		LandId:      req.Land_order.LandId,
		FarmId:      req.Land_order.FarmId,
		UserId:      req.Land_order.UserId,
		FarmAddress: req.Land_order.FarmAddress,
		Price:       req.Land_order.Price,

		Count:       req.Land_order.Count,
		Detail:      sql.NullString{String: req.Land_order.Detail, Valid: req.Land_order.Detail != ""},
		OrderStatus: req.Land_order.OrderStatus,
	}

	_, err = l.svcCtx.LandOrder.Insert(l.ctx, land_order)

	if err != nil {
		logx.Errorw("AddLandOrder failed", logx.Field("err", err))
		return &types.AddLandOrderResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	resp = &types.AddLandOrderResponse{
		Code: 200,
		Msg:  "新增订单成功",
	}
	return resp, nil
}
