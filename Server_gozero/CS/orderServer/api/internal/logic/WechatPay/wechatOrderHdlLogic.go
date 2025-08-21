package WechatPay

import (
	"context"
	"github.com/wechatpay-apiv3/wechatpay-go/services/payments"
	"strconv"

	"Server_gozero/CS/orderServer/api/internal/svc"
	"Server_gozero/CS/orderServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type WechatOrderHdlLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewWechatOrderHdlLogic(ctx context.Context, svcCtx *svc.ServiceContext) *WechatOrderHdlLogic {
	return &WechatOrderHdlLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *WechatOrderHdlLogic) WechatOrderHdl(req payments.Transaction) (resp *types.WechatOrderHandlerResponse, err error) {
	// todo: add your logic here and delete this line

	if *req.TradeState == "SUCCESS" {
		orderID, _ := strconv.Atoi(*req.OutTradeNo)
		l.svcCtx.LandOrder.UpdateOrderStatus(l.ctx, int64(orderID))
		l.svcCtx.GoodOrder.UpdateOrderStatus(l.ctx, int64(orderID))
	}
	return &types.WechatOrderHandlerResponse{
		Code:    "200",
		Message: "",
	}, nil
}
