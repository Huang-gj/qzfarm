package GoodOrder

import (
	"Server_gozero/BS/rpc/BSRPC"
	"Server_gozero/CS/commodityServer/rpc/commodity"
	"Server_gozero/CS/orderServer/model/GoodOrderModel"
	"Server_gozero/common/ISender/ISender"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/zeromicro/go-zero/core/stores/redis"
	"strings"
	"time"

	"Server_gozero/CS/orderServer/api/internal/svc"
	"Server_gozero/CS/orderServer/api/internal/types"

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
func isRedisConnError(err error) bool {
	if err == nil {
		return false
	}
	// 简单示例，根据具体Redis客户端错误来判断
	// 你可以根据自己的Redis客户端错误类型或错误字符串来判断
	errStr := err.Error()
	if strings.Contains(errStr, "connect") ||
		strings.Contains(errStr, "connection refused") ||
		strings.Contains(errStr, "network error") {
		return true
	}
	return false
}
func (l *AddGoodOrderLogic) AddGoodOrder(req *types.AddGoodOrderRequest) (resp *types.AddGoodOrderResponse, err error) {
	// todo: add your logic here and delete this line

	lockKey := fmt.Sprintf("lock:good_order:good:%d", req.Good_order.GoodId)
	lock := redis.NewRedisLock(l.svcCtx.RedisLock, lockKey)
	lock.SetExpire(10)

	ctx, cancel := context.WithTimeout(l.ctx, 5*time.Second)
	defer cancel()

	ok, err := lock.AcquireCtx(ctx)
	if err != nil || !ok {
		logx.Errorw("加锁失败", logx.Field("err", err), logx.Field("ok", ok))
		return &types.AddGoodOrderResponse{Code: 429, Msg: "系统繁忙，请稍后再试"}, err
	}
	defer func() {
		if released, err := lock.Release(); err != nil || !released {
			logx.Errorw("释放锁失败", logx.Field("err", err), logx.Field("released", released))
		}
	}()

	RepertoryResp, err := l.svcCtx.CommodityRPC.GetGood(l.ctx, &commodity.GetGoodRepReq{GoodID: req.Good_order.GoodId})
	if err != nil {
		logx.Errorw("GoodRPC.GetGood ERR！", logx.Field("err", err))
		return &types.AddGoodOrderResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	newRep := RepertoryResp.Repertory - req.Good_order.Count
	if newRep < 0 {
		return &types.AddGoodOrderResponse{Code: 400, Msg: "库存不足"}, nil
	}
	OrderID, err := l.svcCtx.Ident.GetId(l.ctx, &ISender.GetIDReq{BizTag: "order"})
	if err != nil {
		logx.Errorw("分布式唯一id获取错误！", logx.Field("err", err))
		return &types.AddGoodOrderResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	var good_order = &GoodOrderModel.GoodOrder{
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

	_, err = l.svcCtx.CommodityRPC.UpdateRep(l.ctx, &commodity.UpdateRepReq{
		GoodID:    good_order.GoodId,
		Repertory: newRep,
	})
	if err != nil {
		err := l.svcCtx.GoodOrder.Delete(l.ctx, good_order.GoodOrderId)
		if err != nil {
			logx.Errorw("AddGoodOrder failed and rollback failed", logx.Field("err", err))

		}
		logx.Errorw("GoodUpdateRep failed", logx.Field("err", err))
		return &types.AddGoodOrderResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	msg, err := l.svcCtx.BsRpc.AddGoodData(l.ctx, &BSRPC.AddGoodDataReq{FarmId: req.Good_order.FarmId, GoodSaleCount: req.Good_order.Price * float64(req.Good_order.Count)})
	if err != nil {
		logx.Errorw("AddGoodData failed", logx.Field("err", err))
		logx.Errorw("AddGoodData failed", logx.Field("msg", msg))
	}

	resp = &types.AddGoodOrderResponse{
		Code: 200,
		Msg:  "新增订单成功",
	}
	return resp, nil
}
