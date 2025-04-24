package activity

import (
	"gorm.io/datatypes"
	"time"
)

// FarmActivity 用于存储农场动态信息
type FarmActivity struct {
	ActivityID   int            `gorm:"primaryKey;autoIncrement" json:"activity_id"` // 活动ID
	FarmID       int            `gorm:"not null" json:"farm_id"`                     // 关联农场ID
	UnitID       int            `json:"unit_id"`                                     // 关联农场单元ID
	AdoptionID   int            `json:"adoption_id"`                                 // 关联认养订单ID
	ActivityType int            `json:"activity_type"`                               // 活动类型
	Title        string         `gorm:"size:128" json:"title"`                       // 活动标题
	Description  string         `gorm:"type:text" json:"description"`                // 活动描述
	ImageURLs    datatypes.JSON `gorm:"type:json" json:"image_urls"`                 // 活动图片列表，JSON格式
	VideoURL     string         `gorm:"size:512" json:"video_url"`                   // 活动视频URL
	ActivityDate time.Time      `json:"activity_date"`                               // 活动日期
	Operator     string         `gorm:"size:128" json:"operator"`                    // 操作员
	CreatedAt    time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"` // 创建时间
}
