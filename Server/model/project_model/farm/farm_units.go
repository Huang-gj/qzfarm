package farm

import (
	"time"
	"gorm.io/datatypes"
)

// FarmUnit 用于存储农场认养单元信息
type FarmUnit struct {
	UnitID             int            `gorm:"primaryKey;autoIncrement" json:"unit_id"`     // 单元ID
	FarmID             int            `gorm:"not null" json:"farm_id"`                     // 关联农场ID
	AreaID             int            `json:"area_id"`                                     // 关联区域ID
	UnitType           int            `json:"unit_type"`                                   // 单元类型（如种植、养殖等）
	Name               string         `gorm:"size:128" json:"name"`                        // 单元名称
	Description        string         `gorm:"type:text" json:"description"`                // 单元描述
	Size               float64        `gorm:"type:decimal(10,2)" json:"size"`              // 单元大小（亩）
	PricePerDay        float64        `gorm:"type:decimal(10,2)" json:"price_per_day"`     // 每天价格
	MinDays            int            `json:"min_days"`                                    // 最小认养天数
	MaxDays            int            `json:"max_days"`                                    // 最大认养天数
	ImageURLs          datatypes.JSON `gorm:"type:json" json:"image_urls"`                 // 单元图片列表，JSON格式
	VideoURL           string         `gorm:"size:512" json:"video_url"`                   // 单元介绍视频URL
	LocationCoordinate string         `gorm:"size:50" json:"location_coordinate"`          // 单元地理坐标
	PlantOptions       datatypes.JSON `gorm:"type:json" json:"plant_options"`              // 可种植的作物选择，JSON格式
	FishOptions        datatypes.JSON `gorm:"type:json" json:"fish_options"`               // 可养殖的鱼类选择，JSON格式
	CurrentStatus      int            `json:"current_status"`                              // 当前状态(如空闲、认养中等)
	IsFeatured         bool           `gorm:"default:false" json:"is_featured"`            // 是否为推荐单元
	CreatedAt          time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"` // 创建时间
}
