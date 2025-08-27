package WechatPayHdl

import (
	"Server_gozero/CS/orderServer/api/internal/logic/WechatPayHdl"
	"Server_gozero/CS/orderServer/api/internal/types"
	"context"
	"fmt"
	"net/http"

	"Server_gozero/CS/orderServer/api/internal/svc"

	"github.com/pkg/errors"
	"github.com/wechatpay-apiv3/wechatpay-go/core/auth/verifiers"
	"github.com/wechatpay-apiv3/wechatpay-go/core/downloader"
	"github.com/wechatpay-apiv3/wechatpay-go/core/notify"
	"github.com/wechatpay-apiv3/wechatpay-go/services/payments"
	"github.com/wechatpay-apiv3/wechatpay-go/utils"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func WechatOrderHdlHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. 初始化商户API v3 Key及微信支付平台证书

		l := WechatPayHdl.NewWechatOrderHdlLogic(r.Context(), svcCtx)
		transactionInfo, err := SignatureVerification(r, svcCtx)
		if err != nil {
			httpx.WriteJson(w, http.StatusOK, types.WechatOrderHandlerResponse{
				Code:    "FAIL",
				Message: "失败",
			})
		}
		resp, err := l.WechatOrderHdl(*transactionInfo)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}

}

func SignatureVerification(request *http.Request, c *svc.ServiceContext) (*payments.Transaction, error) {

	// 获取微信支付公钥
	wechatpayPublicKey, err := utils.LoadPublicKeyWithPath(c.Config.WechatPay.PubKeyPath)
	if err != nil {
		return nil, fmt.Errorf("load wechatpay public key err:%s", err.Error())
	}

	// 使用 utils 提供的函数从本地文件中加载商户私钥
	mchPrivateKey, err := utils.LoadPrivateKeyWithPath(c.Config.WechatPay.PrivateKeyPath)
	if err != nil {
		return nil, fmt.Errorf("load merchant private key error")
	}

	// 初始化 Client
	//opts := []core.ClientOption{
	//	option.WithWechatPayPublicKeyAuthCipher(
	//		l.svcCtx.Config.WechatPay.MchID, //商户号
	//		l.svcCtx.Config.WechatPay.SerialNumber,
	//		mchPrivateKey,
	//		wechatpayPublicKeyID, wechatpayPublicKey),
	//}
	//client, err := core.NewClient(context.Background(), opts...)

	ctx := context.Background()
	// 1. 使用 `RegisterDownloaderWithPrivateKey` 注册下载器
	err = downloader.MgrInstance().RegisterDownloaderWithPrivateKey(ctx, mchPrivateKey, c.Config.WechatPay.SerialNumber, c.Config.WechatPay.MchID, c.Config.WechatPay.APIv3Key)
	if err != nil {
		return nil, err
	}
	// 2. 获取商户号对应的微信支付平台证书访问器
	certificateVisitor := downloader.MgrInstance().GetCertificateVisitor(c.Config.WechatPay.MchID)

	// 3. 使用证书访问器初始化 `notify.Handler`
	//handler := notify.NewNotifyHandler(l.svcCtx.Config.WechatPay.APIv3Key, verifiers.NewSHA256WithRSAVerifier(certificateVisitor))

	// 初始化 notify.Handler
	//handler, err := notify.NewRSANotifyHandler(l.svcCtx.Config.WechatPay.APIv3Key, verifiers.NewSHA256WithRSAPubkeyVerifier(wechatpayPublicKeyID, *wechatPayPublicKey))
	//if err != nil {
	//	return nil, fmt.Errorf("new notify handler err:%s", err.Error())
	//}

	// 初始化 notify.Handler ，平台证书切换到公私钥期间，回调要同时支持使用平台证书和公钥的验签
	handler := notify.NewNotifyHandler(
		c.Config.WechatPay.APIv3Key,
		verifiers.NewSHA256WithRSACombinedVerifier(certificateVisitor, c.Config.WechatPay.WechatpayPublicKeyID, *wechatpayPublicKey))

	transaction := new(payments.Transaction)
	notifyReq, err := handler.ParseNotifyRequest(context.Background(), request, transaction)
	// 如果验签未通过，或者解密失败
	if err != nil {
		return nil, errors.Errorf("验签未通过 err:%s", err.Error())
	}
	//// 处理通知内容
	//fmt.Println(notifyReq.Summary)
	//fmt.Println(transaction.TransactionId)

	//content := make(map[string]interface{})
	//// 回调消息体，解析至 map[string]interface{}
	//notifyReq, err := handler.ParseNotifyRequest(context.Background(), request, &content)
	//// 如果验签未通过，或者解密失败
	//if err != nil {
	//	return nil, err
	//}

	if notifyReq.EventType != "TRANSACTION.SUCCESS" {
		return nil, fmt.Errorf("支付失败 error: %s", notifyReq.EventType)
	}
	return transaction, nil
}
