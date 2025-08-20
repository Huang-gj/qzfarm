package WechatPay

import (
	"bytes"
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"github.com/wechatpay-apiv3/wechatpay-go/utils"
	"io"
	"net/http"

	"Server_gozero/CS/orderServer/api/internal/logic/WechatPay"
	"Server_gozero/CS/orderServer/api/internal/svc"
	"Server_gozero/CS/orderServer/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func WechatOrderHdlHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.WechatOrderHandlerRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		key, err := utils.LoadPublicKeyWithPath("")
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		}
		wechatpaySignature := r.Header.Get("Wechatpay-Signature")
		wechatpayTimestamp := r.Header.Get("Wechatpay-Timestamp")
		wechatpayNonce := r.Header.Get("Wechatpay-Nonce")
		body, _ := io.ReadAll(r.Body)

		// 需要重新设置 r.Body，否则后续逻辑取不到
		r.Body = io.NopCloser(bytes.NewBuffer(body))
		message := wechatpayTimestamp + "\n" + wechatpayNonce + "\n" + string(body) + "\n"

		// 使用你封装的验签函数
		err = VerifySHA256WithRSA(message, wechatpaySignature, key)
		if err != nil {
			httpx.WriteJson(w, http.StatusBadRequest, map[string]string{
				"code":    "FAIL",
				"message": "失败: ",
			})
			return
		}
		l := WechatPay.NewWechatOrderHdlLogic(r.Context(), svcCtx)
		resp, err := l.WechatOrderHdl(&req)
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
