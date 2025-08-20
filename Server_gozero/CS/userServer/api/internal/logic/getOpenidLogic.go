package logic

import (
	"api/internal/svc"
	"api/internal/types"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetOpenidLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetOpenidLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetOpenidLogic {
	return &GetOpenidLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

// 微信登录凭证校验响应结构
type WechatCode2SessionResponse struct {
	SessionKey string `json:"session_key"`
	Unionid    string `json:"unionid"`
	Errmsg     string `json:"errmsg"`
	Openid     string `json:"openid"`
	Errcode    int32  `json:"errcode"`
}

func (l *GetOpenidLogic) GetOpenid(req *types.GetOpenidRequest) (resp *types.GetOpenidResponse, err error) {
	logx.Infof("开始处理获取openid请求，code: %s", req.Code)

	// 构建请求参数
	params := url.Values{}
	params.Set("appid", l.svcCtx.Config.Wechat.AppId)      // 小程序 appId
	params.Set("secret", l.svcCtx.Config.Wechat.AppSecret) // 小程序 appSecret
	params.Set("js_code", req.Code)                        // 登录时获取的 code
	params.Set("grant_type", "authorization_code")         // 授权类型

	// 构建请求URL
	requestURL := fmt.Sprintf("https://api.weixin.qq.com/sns/jscode2session?%s", params.Encode())
	logx.Infof("请求微信接口URL: %s", requestURL)

	// 发送HTTP请求
	httpResp, err := http.Get(requestURL)
	if err != nil {
		logx.Errorf("请求微信接口失败: %v", err)
		return nil, fmt.Errorf("请求微信接口失败: %v", err)
	}
	defer httpResp.Body.Close()

	// 读取响应内容
	body, err := io.ReadAll(httpResp.Body)
	if err != nil {
		logx.Errorf("读取微信接口响应失败: %v", err)
		return nil, fmt.Errorf("读取微信接口响应失败: %v", err)
	}

	logx.Infof("微信接口响应: %s", string(body))

	// 解析响应JSON
	var wechatResp WechatCode2SessionResponse
	if err := json.Unmarshal(body, &wechatResp); err != nil {
		logx.Errorf("解析微信接口响应JSON失败: %v", err)
		return nil, fmt.Errorf("解析微信接口响应失败: %v", err)
	}

	// 检查微信接口返回的错误码
	if wechatResp.Errcode != 0 {
		logx.Errorf("微信接口返回错误: errcode=%d, errmsg=%s", wechatResp.Errcode, wechatResp.Errmsg)
		return &types.GetOpenidResponse{
			ErrCode: int(wechatResp.Errcode),
			ErrMsg:  wechatResp.Errmsg,
		}, nil
	}

	// 检查是否成功获取openid
	if wechatResp.Openid == "" {
		logx.Error("微信接口未返回openid")
		return &types.GetOpenidResponse{
			ErrCode: -1,
			ErrMsg:  "未获取到openid",
		}, nil
	}

	logx.Infof("成功获取openid: %s", wechatResp.Openid)

	// 返回成功响应
	resp = &types.GetOpenidResponse{
		Openid:     wechatResp.Openid,
		SessionKey: wechatResp.SessionKey,
		Unionid:    wechatResp.Unionid,
		ErrCode:    0,
		ErrMsg:     "",
	}

	return resp, nil
}
