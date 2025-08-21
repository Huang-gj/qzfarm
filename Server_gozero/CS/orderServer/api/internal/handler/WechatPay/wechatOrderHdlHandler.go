package WechatPay

import (
	"context"
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"fmt"
	"github.com/wechatpay-apiv3/wechatpay-go/core"
	"github.com/wechatpay-apiv3/wechatpay-go/core/auth/verifiers"
	"github.com/wechatpay-apiv3/wechatpay-go/core/notify"
	"github.com/wechatpay-apiv3/wechatpay-go/services/payments"
	"github.com/wechatpay-apiv3/wechatpay-go/utils"

	"net/http"

	"Server_gozero/CS/orderServer/api/internal/logic/WechatPay"
	"Server_gozero/CS/orderServer/api/internal/svc"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func WechatOrderHdlHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. 初始化商户API v3 Key及微信支付平台证书
		mchAPIv3Key := "<your apiv3 key>"
		wechatPayCert, err := utils.LoadCertificate("<your wechat pay certificate>")
		// 2. 使用本地管理的微信支付平台证书获取微信支付平台证书访问器
		certificateVisitor := core.NewCertificateMapWithList([]*x509.Certificate{wechatPayCert})
		// 3. 使用apiv3 key、证书访问器初始化 `notify.Handler`
		handler := notify.NewNotifyHandler(mchAPIv3Key, verifiers.NewSHA256WithRSAVerifier(certificateVisitor))

		transaction := new(payments.Transaction)
		notifyReq, err := handler.ParseNotifyRequest(context.Background(), r, transaction)
		// 如果验签未通过，或者解密失败
		if err != nil {
			fmt.Println(err)
			return
		}
		// 处理通知内容
		fmt.Println(notifyReq.Summary)
		fmt.Println(transaction.TransactionId)

		l := WechatPay.NewWechatOrderHdlLogic(r.Context(), svcCtx)
		resp, err := l.WechatOrderHdl(*transaction)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}

func VerifySHA256WithRSA(source string, signature string, publicKey *rsa.PublicKey) error {
	if publicKey == nil {
		return fmt.Errorf("public key should not be nil")
	}

	sigBytes, err := base64.StdEncoding.DecodeString(signature)
	if err != nil {
		return fmt.Errorf("verify failed: signature is not base64 encoded")
	}
	hashed := sha256.Sum256([]byte(source))
	err = rsa.VerifyPKCS1v15(publicKey, crypto.SHA256, hashed[:], sigBytes)
	if err != nil {
		return fmt.Errorf("verify signature with public key error:%s", err.Error())
	}
	return nil
}
