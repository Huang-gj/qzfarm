package farm

import (
	"time"
)

// FarmEventBooking 用于存储农场活动预约信息
type FarmEventBooking struct {
	BookingID int       `gorm:"primaryKey;autoIncrement" json:"booking_id"`  // 预约ID
	FarmID    int       `gorm:"not null" json:"farm_id"`                     // 关联农场ID
	UserID    int       `gorm:"not null" json:"user_id"`                     // 用户ID
	EventName string    `gorm:"size:128" json:"event_name"`                  // 活动名称
	EventDate time.Time `gorm:"type:date" json:"event_date"`                 // 活动日期
	EventTime string    `gorm:"type:time" json:"event_time"`                 // 活动时间
	Attendees int       `json:"attendees"`                                   // 参与人数
	Status    int       `gorm:"default:0" json:"status"`                     // 状态(0=待确认,1=已确认,2=已取消)
	Notes     string    `gorm:"type:text" json:"notes"`                      // 备注
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"` // 创建时间
	UpdatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"` // 更新时间
}
