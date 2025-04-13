package farm

import (
	"time"
)

// FarmMonitor 用于存储农场实时监控信息
type FarmMonitor struct {
	MonitorID int       `gorm:"primaryKey;autoIncrement" json:"monitor_id"`  // 监控ID
	FarmID    int       `gorm:"not null" json:"farm_id"`                     // 关联农场ID
	UnitID    int       `json:"unit_id"`                                     // 关联农场单元ID
	CameraURL string    `gorm:"size:512" json:"camera_url"`                  // 摄像头URL
	Status    int       `json:"status"`                                      // 状态（1=开启，0=关闭）
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"` // 创建时间
}
