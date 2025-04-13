package order

import (
	"time"
)

// OrderSettleSummary 用于存储订单结算的汇总信息
type OrderSettleSummary struct {
	SettleID             int       `gorm:"primaryKey;autoIncrement" json:"settle_id"`        // 结算ID
	TotalGoodsCount      int       `json:"total_goods_count"`                                // 商品总数
	PackageCount         int       `json:"package_count"`                                    // 包裹数量
	TotalAmount          float64   `gorm:"type:decimal(10,2)" json:"total_amount"`           // 总金额
	TotalPayAmount       float64   `gorm:"type:decimal(10,2)" json:"total_pay_amount"`       // 实际支付金额
	TotalDiscountAmount  float64   `gorm:"type:decimal(10,2)" json:"total_discount_amount"`  // 总折扣金额
	TotalPromotionAmount float64   `gorm:"type:decimal(10,2)" json:"total_promotion_amount"` // 总优惠金额
	TotalCouponAmount    float64   `gorm:"type:decimal(10,2)" json:"total_coupon_amount"`    // 优惠券金额
	TotalSalePrice       float64   `gorm:"type:decimal(10,2)" json:"total_sale_price"`       // 商品销售总金额
	TotalGoodsAmount     float64   `gorm:"type:decimal(10,2)" json:"total_goods_amount"`     // 商品总金额
	TotalDeliveryFee     float64   `gorm:"type:decimal(10,2)" json:"total_delivery_fee"`     // 配送费用
	InvoiceRequest       string    `gorm:"size:128" json:"invoice_request"`                  // 发票请求
	InvoiceSupport       bool      `json:"invoice_support"`                                  // 是否支持开具发票
	SettleType           int       `json:"settle_type"`                                      // 结算类型
	UserAddressID        int       `json:"user_address_id"`                                  // 用户地址ID
	CreatedAt            time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`      // 创建时间
	OrderType            int       `gorm:"default:1" json:"order_type"`                      // 订单类型
	AdoptionID           int       `json:"adoption_id"`                                      // 认养ID
	FarmID               int       `json:"farm_id"`                                          // 关联农场ID
	FarmUnitID           int       `json:"farm_unit_id"`                                     // 认养单元ID
	AdoptionStartDate    time.Time `json:"adoption_start_date"`                              // 认养开始日期
	AdoptionEndDate      time.Time `json:"adoption_end_date"`                                // 认养结束日期
	UserID               int       `json:"user_id"`                                          // 用户ID
}
