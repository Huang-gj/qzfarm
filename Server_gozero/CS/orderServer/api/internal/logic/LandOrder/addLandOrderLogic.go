package LandOrder

import (
	"Server_gozero/BS/rpc/BSRPC"
	"Server_gozero/CS/commodityServer/rpc/commodity"
	"Server_gozero/CS/orderServer/model/LandOrderModel"
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

	// todo: add your logic here and delete this line

	lockKey := fmt.Sprintf("lock:land_order:land:%d", req.Land_order.LandId)
	lock := redis.NewRedisLock(l.svcCtx.RedisLock, lockKey)
	lock.SetExpire(10)

	ctx, cancel := context.WithTimeout(l.ctx, 5*time.Second)
	defer cancel()

	ok, err := lock.AcquireCtx(ctx)
	if err != nil || !ok {
		logx.Errorw("加锁失败", logx.Field("err", err), logx.Field("ok", ok))
		return &types.AddLandOrderResponse{Code: 429, Msg: "系统繁忙，请稍后再试"}, err
	}
	defer func() {
		if released, err := lock.Release(); err != nil || !released {
			logx.Errorw("释放锁失败", logx.Field("err", err), logx.Field("released", released))
		}
	}()

	// 判断是否还有库存
	landStatusResp, err := l.svcCtx.CommodityRPC.GetLand(l.ctx, &commodity.GetLandRepReq{LandID: req.Land_order.LandId})
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
	var land_order = &LandOrderModel.LandOrder{
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

	_, err = l.svcCtx.CommodityRPC.UpdateStatus(l.ctx, &commodity.UpdateStatusReq{
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
	msg, err := l.svcCtx.BsRpc.AddLandData(l.ctx, &BSRPC.AddLandDataReq{FarmId: req.Land_order.FarmId, LandSaleCount: req.Land_order.Price * float64(req.Land_order.Count)})
	if err != nil {
		logx.Errorw("AddLandData failed", logx.Field("err", err))
		logx.Errorw("AddLandData failed", logx.Field("msg", msg))
	}
	resp = &types.AddLandOrderResponse{
		Code: 200,
		Msg:  "新增订单成功",
	}
	return resp, nil
}
