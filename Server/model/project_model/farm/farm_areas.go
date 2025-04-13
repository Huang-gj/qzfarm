package farm

import (
	"time"
	"gorm.io/datatypes"
)

// FarmArea 用于存储农场区域信息
type FarmArea struct {
	AreaID        int            `gorm:"primaryKey;autoIncrement" json:"area_id"`     // 区域ID
	FarmID        int            `gorm:"not null" json:"farm_id"`                     // 关联农场ID
	Name          string         `gorm:"size:128;not null" json:"name"`               // 区域名称
	Description   string         `gorm:"type:text" json:"description"`                // 区域描述
	Location      string         `gorm:"size:128" json:"location"`                    // 区域位置描述
	TotalSize     float64        `gorm:"type:decimal(10,2)" json:"total_size"`        // 区域总面积
	AvailableSize float64        `gorm:"type:decimal(10,2)" json:"available_size"`    // 可用面积
	ImageURLs     datatypes.JSON `gorm:"type:json" json:"image_urls"`                 // 区域图片列表，JSON格式
	Status        int            `gorm:"default:1" json:"status"`                     // 区域状态(1=正常, 0=不可用)
	CreatedAt     time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"` // 创建时间
}
