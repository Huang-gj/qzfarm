package WechatPay

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/wechatpay-apiv3/wechatpay-go/utils"
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

func (l *WechatOrderHdlLogic) WechatOrderHdl(req *types.WechatOrderHandlerRequest) (resp *types.WechatOrderHandlerResponse, err error) {
	// todo: add your logic here and delete this line

	apiV3 := l.svcCtx.Config.WechatPay.ApiV3
	plaintext, err := utils.DecryptAES256GCM(apiV3, req.Resource.Associated_data, req.Resource.Nonce, req.Resource.Ciphertext)
	if err != nil {
		logx.Error("回调解密失败: ", err)
		return
	}
	var notify WechatPayNotify
	if err := json.Unmarshal([]byte(plaintext), &notify); err != nil {
		return &types.WechatOrderHandlerResponse{
			Code:    "FAIL",
			Message: "失败",
		}, fmt.Errorf("解析失败: %v", err)
	}

	if notify.TradeState == "SUCCESS" {
		orderID, _ := strconv.Atoi(notify.OutTradeNo)
		l.svcCtx.LandOrder.UpdateOrderStatus(l.ctx, int64(orderID))
		l.svcCtx.GoodOrder.UpdateOrderStatus(l.ctx, int64(orderID))
	}
	return &types.WechatOrderHandlerResponse{
		Code:    "200",
		Message: "",
	}, nil
}
