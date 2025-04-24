package order

import (
	"time"
)

// OrderDelivery 用于存储订单配送信息
type OrderDelivery struct {
	DeliveryID             int       `gorm:"primaryKey;autoIncrement" json:"delivery_id"`
	SettleID               int       `gorm:"index" json:"settle_id"` // 添加索引，提高查询效率
	DeliveryFee            float64   `gorm:"type:decimal(10,2)" json:"delivery_fee"`
	DeliveryWords          string    `gorm:"size:128" json:"delivery_words"`
	DeliveryTime           time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"delivery_time"`
	FarmID                 int       `gorm:"index" json:"farm_id"` // 添加索引，提高查询效率
	IsDirectFromFarm       bool      `gorm:"default:false" json:"is_direct_from_farm"`
	HarvestToDeliveryHours int       `json:"harvest_to_delivery_hours"`
	FarmPickupAvailable    bool      `gorm:"default:false" json:"farm_pickup_available"`
}
