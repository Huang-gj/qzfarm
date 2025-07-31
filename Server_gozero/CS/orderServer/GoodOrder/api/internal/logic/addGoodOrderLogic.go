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
	"fmt"
	"github.com/zeromicro/go-zero/core/stores/redis"
	"strings"
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

	lockKey := fmt.Sprintf("lock:good_order:good:%s", req.Good_order.GoodId)

	lock := redis.NewRedisLock(l.svcCtx.RedisLock, lockKey)
	lock.SetExpire(5) // 设置锁的过期时间，避免死锁（秒）

	ctx, cancel := context.WithTimeout(l.ctx, 3*time.Second) // 控制最多等待 3 秒获取锁
	defer cancel()

	ok, err := lock.AcquireCtx(ctx)
	if err != nil {
		if isRedisConnError(err) {
			logx.Errorw("AddLandOrder Redis连接失败", logx.Field("err", err))
			return &types.AddGoodOrderResponse{Code: 503, Msg: "服务暂不可用，请稍后重试"}, err
		}
		logx.Errorw("AddLandOrder加锁失败！", logx.Field("err", err))
		return &types.AddGoodOrderResponse{Code: 400, Msg: "内部错误"}, err
	}
	if !ok {
		logx.Errorw("AddLandOrder获取锁失败，可能锁已被占用")
		return &types.AddGoodOrderResponse{Code: 429, Msg: "请求过于频繁，请稍后重试"}, errors.New("获取锁失败")
	}

	defer func() {
		ok, err := lock.Release()
		if err != nil {
			if isRedisConnError(err) {
				logx.Errorf("AddLandOrder释放锁失败，Redis连接异常: %v", err)
				return
			}
			logx.Errorf("AddLandOrder释放锁失败: %v", err)
		}
		if !ok {
			logx.Error("AddLandOrder释放锁失败，返回false")
		}
	}()
	RepertoryResp, err := l.svcCtx.GoodRPC.GetGood(l.ctx, &good.GetGoodRepReq{GoodID: req.Good_order.GoodId})
	if err != nil {
		logx.Errorw("GoodRPC.GetGood ERR！", logx.Field("err", err))
		return &types.AddGoodOrderResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	newRep := RepertoryResp.Repertory - req.Good_order.Count
	if newRep < 0 {
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

	_, err = l.svcCtx.GoodRPC.UpdateRep(l.ctx, &good.UpdateRepReq{
		GoodID:    good_order.GoodId,
		Repertory: newRep,
	})
	if err != nil {
		err := l.svcCtx.GoodOrder.Delete(l.ctx, good_order.GoodId)
		if err != nil {
			logx.Errorw("AddGoodOrder failed and rollback failed", logx.Field("err", err))

		}
		logx.Errorw("GoodUpdateRep failed", logx.Field("err", err))
		return &types.AddGoodOrderResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}

	resp = &types.AddGoodOrderResponse{
		Code: 200,
		Msg:  "新增订单成功",
	}
	return resp, nil
}
