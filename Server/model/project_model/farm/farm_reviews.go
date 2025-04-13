package farm

import (
	"time"
	"gorm.io/datatypes"
)

// FarmReview 用于存储农场评价信息
type FarmReview struct {
	ReviewID  int            `gorm:"primaryKey;autoIncrement" json:"review_id"`   // 评价ID
	FarmID    int            `gorm:"not null" json:"farm_id"`                     // 关联农场ID
	UserID    int            `gorm:"not null" json:"user_id"`                     // 关联用户ID
	Content   string         `gorm:"type:text" json:"content"`                    // 评价内容
	Rating    float64        `gorm:"type:decimal(2,1)" json:"rating"`             // 评分（1-5）
	VisitDate time.Time      `json:"visit_date"`                                  // 访问日期
	ImageURLs datatypes.JSON `gorm:"type:json" json:"image_urls"`                 // 图片列表，JSON格式
	Status    int            `gorm:"default:1" json:"status"`                     // 状态(1=已发布,0=待审核)
	CreatedAt time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"` // 创建时间
}
