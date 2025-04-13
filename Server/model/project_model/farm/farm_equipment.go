package farm

import (
	"time"
)

// FarmEquipment 用于存储农场设备信息
type FarmEquipment struct {
	EquipmentID   int       `gorm:"primaryKey;autoIncrement" json:"equipment_id"` // 设备ID
	FarmID        int       `gorm:"not null" json:"farm_id"`                      // 关联农场ID
	Name          string    `gorm:"size:128;not null" json:"name"`                // 设备名称
	EquipmentType int       `gorm:"" json:"equipment_type"`                       // 设备类型
	Description   string    `gorm:"type:text" json:"description"`                 // 设备描述
	PurchaseDate  time.Time `gorm:"" json:"purchase_date"`                        // 购买日期
	Status        int       `gorm:"default:1" json:"status"`                      // 状态(1=正常,0=维修中)
	LastCheck     time.Time `gorm:"" json:"last_check"`                           // 最后检查日期
	CreatedAt     time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`  // 创建时间
}
