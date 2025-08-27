package WechatPay

import (
	"context"
	"strconv"
	"strings"

	"github.com/wechatpay-apiv3/wechatpay-go/services/payments"

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
func extractID(input string) string {
	parts := strings.SplitN(input, "*", 2) // 只分割成两部分
	if len(parts) < 2 {
		return "" // 如果没有*，返回空字符串
	}
	return parts[0]
}
func (l *WechatOrderHdlLogic) WechatOrderHdl(req payments.Transaction) (resp *types.WechatOrderHandlerResponse, err error) {
	// todo: add your logic here and delete this line

	if *req.TradeState == "SUCCESS" {
		replace := extractID(*req.OutTradeNo)
		orderID, _ := strconv.Atoi(replace)
		l.svcCtx.LandOrder.UpdateOrderStatus(l.ctx, int64(orderID))
		l.svcCtx.GoodOrder.UpdateOrderStatus(l.ctx, int64(orderID))
	}
	return &types.WechatOrderHandlerResponse{
		Code:    "200",
		Message: "",
	}, nil
}
