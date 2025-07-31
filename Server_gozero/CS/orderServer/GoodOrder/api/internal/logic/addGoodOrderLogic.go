package logic

import (
	"Server_gozero/CS/commodityServer/good/rpc/good"
	"Server_gozero/CS/common/ISender/ISender"
	"Server_gozero/CS/orderServer/GoodOrder/api/internal/svc"
	"Server_gozero/CS/orderServer/GoodOrder/api/internal/types"
	"Server_gozero/CS/orderServer/GoodOrder/model"
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/zeromicro/go-zero/core/logx"
)

type AddGoodOrderLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewAddGoodOrderLogic(ctx context.Context, svcCtx *svc.ServiceContext) *AddGoodOrderLogic {
	return &AddGoodOrderLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *AddGoodOrderLogic) AddGoodOrder(req *types.AddGoodOrderRequest) (resp *types.AddGoodOrderResponse, err error) {
	// todo: add your logic here and delete this line
	RepertoryResp, err := l.svcCtx.GoodRPC.GetGood(l.ctx, &good.GetGoodRepReq{GoodID: req.Good_order.GoodId})
	if err != nil {
		logx.Errorw("GoodRPC.GetGood ERR！", logx.Field("err", err))
		return &types.AddGoodOrderResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	if RepertoryResp.Repertory <= 0 {
		return &types.AddGoodOrderResponse{Code: 400, Msg: "库存不足"}, nil
	}
	OrderID, err := l.svcCtx.Ident.GetId(l.ctx, &ISender.GetIDReq{BizTag: "good_order"})
	if err != nil {
		logx.Errorw("分布式唯一id获取错误！", logx.Field("err", err))
		return &types.AddGoodOrderResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	var good_order = &model.GoodOrder{
		CreateTime:  time.Now(),
		DelState:    0,
		DelTime:     time.Now(),
		GoodOrderId: OrderID,
		ImageUrls:   sql.NullString{String: req.Good_order.ImageUrls, Valid: req.Good_order.ImageUrls != ""},
		GoodId:      req.Good_order.GoodId,
		FarmId:      req.Good_order.FarmId,
		UserId:      req.Good_order.UserId,
		UserAddress: req.Good_order.UserAddress,
		FarmAddress: req.Good_order.FarmAddress,
		Price:       req.Good_order.Price,
		Units:       req.Good_order.Units,
		Count:       req.Good_order.Count,
		Detail:      sql.NullString{String: req.Good_order.Detail, Valid: req.Good_order.Detail != ""},
		OrderStatus: req.Good_order.OrderStatus,
	}

	_, err = l.svcCtx.GoodOrder.Insert(l.ctx, good_order)

	if err != nil {
		logx.Errorw("AddGoodOrder failed", logx.Field("err", err))
		return &types.AddGoodOrderResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	resp = &types.AddGoodOrderResponse{
		Code: 200,
		Msg:  "新增订单成功",
	}
	return resp, nil
}
