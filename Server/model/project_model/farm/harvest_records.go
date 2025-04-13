package farm

import (
	"time"
	"gorm.io/datatypes"
)

// HarvestRecord 用于存储农产品收获信息
type HarvestRecord struct {
	HarvestID      int            `gorm:"primaryKey;autoIncrement" json:"harvest_id"`  // 收获记录ID
	FarmID         int            `gorm:"not null" json:"farm_id"`                     // 关联农场ID
	AdoptionID     int            `json:"adoption_id"`                                 // 关联认养订单ID
	UserID         int            `json:"user_id"`                                     // 用户ID
	UnitID         int            `json:"unit_id"`                                     // 关联农场单元ID
	ProductType    string         `gorm:"size:128" json:"product_type"`                // 产品类型（如作物、鱼类等）
	ProductName    string         `gorm:"size:128" json:"product_name"`                // 产品名称
	Quantity       float64        `gorm:"type:decimal(10,2)" json:"quantity"`          // 收获数量
	Unit           string         `gorm:"size:50" json:"unit"`                         // 单位（如公斤、条等）
	HarvestDate    time.Time      `json:"harvest_date"`                                // 收获日期
	DeliveryMethod int            `json:"delivery_method"`                             // 配送方式（如自取、配送等）
	DeliveryStatus int            `json:"delivery_status"`                             // 配送状态
	ImageURLs      datatypes.JSON `gorm:"type:json" json:"image_urls"`                 // 收获产品图片，JSON格式
	Notes          string         `gorm:"type:text" json:"notes"`                      // 备注
	CreatedAt      time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"` // 创建时间
}
