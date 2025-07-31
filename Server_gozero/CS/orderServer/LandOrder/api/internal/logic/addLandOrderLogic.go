package logic

import (
	"Server_gozero/CS/commodityServer/land/rpc/land"
	"Server_gozero/CS/common/ISender/ISender"
	"fmt"
	"github.com/zeromicro/go-zero/core/stores/redis"
	"strings"

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

func (l *AddLandOrderLogic) AddLandOrder(req *types.AddLandOrderRequest) (resp *types.AddLandOrderResponse, err error) {
	// todo: add your logic here and delete this line

	lockKey := fmt.Sprintf("lock:land_order:land:%s", req.Land_order.LandId)

	lock := redis.NewRedisLock(l.svcCtx.RedisLock, lockKey)
	lock.SetExpire(5) // 设置锁的过期时间，避免死锁（秒）

	ctx, cancel := context.WithTimeout(l.ctx, 3*time.Second) // 控制最多等待 3 秒获取锁
	defer cancel()

	ok, err := lock.AcquireCtx(ctx)
	if err != nil {
		if isRedisConnError(err) {
			logx.Errorw("AddLandOrder Redis连接失败", logx.Field("err", err))
			return &types.AddLandOrderResponse{Code: 503, Msg: "服务暂不可用，请稍后重试"}, err
		}
		logx.Errorw("AddLandOrder加锁失败！", logx.Field("err", err))
		return &types.AddLandOrderResponse{Code: 400, Msg: "内部错误"}, err
	}
	if !ok {
		logx.Errorw("AddLandOrder获取锁失败，可能锁已被占用")
		return &types.AddLandOrderResponse{Code: 429, Msg: "请求过于频繁，请稍后重试"}, errors.New("获取锁失败")
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

	// 判断是否还有库存
	landStatusResp, err := l.svcCtx.LandRPC.GetLand(l.ctx, &land.GetLandRepReq{LandID: req.Land_order.LandId})
	if err != nil {
		logx.Errorw("LandRPC.GetLand ERR！", logx.Field("err", err))
		return &types.AddLandOrderResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	if landStatusResp.SaleStatus == 1 {
		return &types.AddLandOrderResponse{Code: 400, Msg: "该土地已经被租赁！"}, nil
	}

	//生成订单的分布式唯一ID
	OrderID, err := l.svcCtx.Ident.GetId(l.ctx, &ISender.GetIDReq{BizTag: "land_order"})
	if err != nil {
		logx.Errorw("分布式唯一id获取错误！", logx.Field("err", err))
		return &types.AddLandOrderResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}

	//写入订单数据
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

	_, err = l.svcCtx.LandRPC.UpdateStatus(l.ctx, &land.UpdateStatusReq{
		LandID:     land_order.LandId,
		SaleStatus: 1,
	})

	if err != nil {
		err := l.svcCtx.LandOrder.Delete(l.ctx, OrderID)
		if err != nil {
			logx.Errorw("LandUpdateStatus failed and rollback failed", logx.Field("err", err))

		}
		logx.Errorw("LandUpdateStatus failed", logx.Field("err", err))
		return &types.AddLandOrderResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	resp = &types.AddLandOrderResponse{
		Code: 200,
		Msg:  "新增订单成功",
	}
	return resp, nil
}
