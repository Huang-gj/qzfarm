package order

import (
	"time"
)

// OrderCoupon 用于存储订单中使用的优惠券信息
type OrderCoupon struct {
	CouponID               int       `gorm:"primaryKey;autoIncrement" json:"coupon_id"` // 优惠券ID
	SettleID               int       `json:"settle_id"`                                 // 结算ID
	CouponValue            float64   `gorm:"type:decimal(10,2)" json:"coupon_value"`    // 优惠券面值
	CouponType             int       `json:"coupon_type"`                               // 优惠券类型
	Status                 string    `gorm:"size:50" json:"status"`                     // 优惠券状态
	UsedAt                 time.Time `json:"used_at"`                                   // 使用时间
	FarmID                 int       `json:"farm_id"`                                   // 关联农场ID
	ApplicableAdoptionType int       `json:"applicable_adoption_type"`                  // 适用的认养类型

}
