package WechatPay

import (
	"context"

	"github.com/wechatpay-apiv3/wechatpay-go/core"
	"github.com/wechatpay-apiv3/wechatpay-go/core/option"

	"log"

	"Server_gozero/CS/orderServer/api/internal/svc"
	"Server_gozero/CS/orderServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"

	"github.com/wechatpay-apiv3/wechatpay-go/services/payments/jsapi"
	"github.com/wechatpay-apiv3/wechatpay-go/utils"
)

type WechatOrderLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewWechatOrderLogic(ctx context.Context, svcCtx *svc.ServiceContext) *WechatOrderLogic {
	return &WechatOrderLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *WechatOrderLogic) WechatOrder(request *types.WechatOrderRequest) (response *types.WechatOrderResponse, err error) {
	// todo: add your logic here and delete this line
	var (
		mchID                      = l.svcCtx.Config.WechatPay.MchID        // 商户号
		mchCertificateSerialNumber = l.svcCtx.Config.WechatPay.SerialNumber // 商户证书序列号
		mchAPIv3Key                = l.svcCtx.Config.WechatPay.APIv3Key     // 商户APIv3密钥

	)

	// 使用 utils 提供的函数从本地文件中加载商户私钥，商户私钥会用来生成请求的签名
	mchPrivateKey, err := utils.LoadPrivateKeyWithPath(l.svcCtx.Config.WechatPay.PrivateKeyPath)
	if err != nil {
		log.Fatal("load merchant private key error")
	}

	ctx := context.Background()
	// 使用商户私钥等初始化 client，并使它具有自动定时获取微信支付平台证书的能力
	opts := []core.ClientOption{
		option.WithWechatPayAutoAuthCipher(mchID, mchCertificateSerialNumber, mchPrivateKey, mchAPIv3Key),
	}
	client, err := core.NewClient(ctx, opts...)
	if err != nil {
		log.Fatalf("new wechat pay client err:%s", err)
	}

	// 发送请求，以下载微信支付平台证书为例
	// https://pay.weixin.qq.com/wiki/doc/apiv3/wechatpay/wechatpay5_1.shtml
	//svc := certificates.CertificatesApiService{Client: client}
	//resp, result, err := svc.DownloadCertificates(ctx)
	//log.Printf("status=%d resp=%s", result.Response.StatusCode, resp)

	JSAPIsvc := jsapi.JsapiApiService{Client: client}
	// 得到prepay_id，以及调起支付所需的参数和签名
	resp, _, err := JSAPIsvc.PrepayWithRequestPayment(ctx,
		jsapi.PrepayRequest{
			Appid:       core.String(l.svcCtx.Config.WechatPay.Appid),
			Mchid:       core.String(l.svcCtx.Config.WechatPay.MchID),
			Description: core.String(request.Description),
			OutTradeNo:  core.String(request.OutTradeNo),
			Attach:      core.String(request.Attach),
			NotifyUrl:   core.String(l.svcCtx.Config.WechatPay.NotifyUrl),
			Amount: &jsapi.Amount{
				Total: core.Int64(int64(request.Amount.Total)),
			},
			Payer: &jsapi.Payer{
				Openid: core.String(request.Payer.OpenID),
			},
		},
	)

	if err != nil {
		logx.Errorw("微信支付失败", logx.Field("err", resp))
	}
	return &types.WechatOrderResponse{
		TimeStamp: *resp.TimeStamp,
		NonceStr:  *resp.NonceStr,
		Package:   *resp.Package,
		SignType:  *resp.SignType,
		PaySign:   *resp.PaySign,
	}, nil
}
