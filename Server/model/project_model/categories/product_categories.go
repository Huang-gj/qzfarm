package categories

import (
	"time"
)

type ProductCategory struct {
	CategoryID   int       `gorm:"primaryKey;autoIncrement" json:"category_id"` // 分类ID
	CategoryName string    `gorm:"size:128;not null" json:"category_name"`      // 分类名称
	Description  string    `gorm:"size:1024" json:"description"`                // 描述
	ParentID     int       `gorm:"index" json:"parent_id"`                      // 父分类ID
	ImageURL     string    `gorm:"size:512" json:"image_url"`                   // 图片URL
	Status       int       `gorm:"default:1" json:"status"`                     // 状态
	CreatedAt    time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"` // 创建时间
}
