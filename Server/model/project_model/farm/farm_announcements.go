package farm

import (
	"time"
)

// FarmAnnouncement 用于存储农场公告信息
type FarmAnnouncement struct {
	AnnouncementID int       `gorm:"primaryKey;autoIncrement" json:"announcement_id"` // 公告ID
	FarmID         int       `gorm:"not null" json:"farm_id"`                         // 关联农场ID
	Title          string    `gorm:"size:128;not null" json:"title"`                  // 公告标题
	Content        string    `gorm:"type:text" json:"content"`                        // 公告内容
	PublishTime    time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"publish_time"`   // 发布时间
	EndTime        time.Time `gorm:"" json:"end_time"`                                // 结束时间
	IsImportant    bool      `gorm:"default:false" json:"is_important"`               // 是否重要
	Status         int       `gorm:"default:1" json:"status"`                         // 状态(1=显示,0=隐藏)
}
