package order

import (
	"time"
)

// OrderProductDetail 用于存储订单中商品的具体详情
type OrderProductDetail struct {
	DetailID         int       `gorm:"primaryKey;autoIncrement" json:"detail_id"`          // 订单商品详情ID
	SettleID         int       `gorm:"not null" json:"settle_id"`                          // 关联结算ID
	ProductID        int       `gorm:"not null" json:"product_id"`                         // 商品ID
	FarmID           int       `gorm:"not null" json:"farm_id"`                            // 关联农场ID
	ProductName      string    `gorm:"size:128" json:"product_name"`                       // 商品名称
	Image            string    `gorm:"size:512" json:"image"`                              // 商品图片URL
	Quantity         int       `gorm:"not null" json:"quantity"`                           // 商品数量
	Unit             string    `gorm:"size:50" json:"unit"`                                // 计量单位
	UnitPrice        float64   `gorm:"type:decimal(10,2)" json:"unit_price"`               // 单价
	TotalPrice       float64   `gorm:"type:decimal(10,2)" json:"total_price"`              // 总价
	DiscountPrice    float64   `gorm:"type:decimal(10,2);default:0" json:"discount_price"` // 折扣金额
	ActualPrice      float64   `gorm:"type:decimal(10,2)" json:"actual_price"`             // 实际支付价格
	IsFarmProduct    bool      `gorm:"default:true" json:"is_farm_product"`                // 是否为农场产品
	HarvestID        int       `json:"harvest_id"`                                         // 收获ID
	HarvestDate      time.Time `json:"harvest_date"`                                       // 收获日期
	OrganicCertified bool      `gorm:"default:false" json:"organic_certified"`             // 是否有机认证
	PlantingMethod   string    `gorm:"size:128" json:"planting_method"`                    // 种植方法
	CreatedAt        time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`        // 创建时间

}
