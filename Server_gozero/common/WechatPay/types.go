package WechatPay

type WechatOrderRequest struct {
	AppID         string     `json:"appid"`
	MchID         string     `json:"mchid"`
	Description   string     `json:"description"`
	OutTradeNo    string     `json:"out_trade_no"`
	TimeExpire    string     `json:"time_expire"`
	Attach        string     `json:"attach"`
	NotifyUrl     string     `json:"notify_url"`
	GoodsTag      string     `json:"goods_tag"`
	SupportFapiao bool       `json:"support_fapiao"`
	Amount        Amount     `json:"amount"`
	Payer         Payer      `json:"payer"`
	Detail        Detail     `json:"detail"`
	SceneInfo     SceneInfo  `json:"scene_info"`
	SettleInfo    SettleInfo `json:"settle_info"`
}

type WechatOrderResponse struct {
	TimeStamp string `json:"time_stamp"`
	NonceStr  string `json:"nonce_str"`
	Package   string `json:"package"`
	SignType  string `json:"sign_type"`
	PaySign   string `json:"pay_sign"`
}

type Amount struct {
	Total    int    `json:"total"`
	Currency string `json:"currency"`
}

type Detail struct {
	CostPrice   int         `json:"cost_price"`
	InvoiceID   string      `json:"invoice_id"`
	GoodsDetail GoodsDetail `json:"goods_detail"`
}
type GoodsDetail struct {
	MerchantGoodsID  string `json:"merchant_goods_id"`
	WechatpayGoodsID string `json:"wechatpay_goods_id"`
	GoodsName        string `json:"goods_name"`
	Quantity         int    `json:"quantity"`
	UnitPrice        int    `json:"unit_price"`
}

type Payer struct {
	OpenID string `json:"openid"`
}

type SceneInfo struct {
	PayerClientIP string    `json:"payer_client_ip"`
	DeviceID      string    `json:"device_id"`
	StoreInfo     StoreInfo `json:"store_info"`
}

type SettleInfo struct {
	ProfitSharing bool `json:"profit_sharing"`
}

type StoreInfo struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	AreaCode string `json:"area_code"`
	Address  string `json:"address"`
}
