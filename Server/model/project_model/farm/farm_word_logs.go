package farm

import (
	"time"
	"gorm.io/datatypes"
)

// FarmWorkLog 用于存储农场工作日志信息
type FarmWorkLog struct {
	LogID       int            `gorm:"primaryKey;autoIncrement" json:"log_id"`      // 日志ID
	FarmID      int            `gorm:"not null" json:"farm_id"`                     // 关联农场ID
	UnitID      int            `gorm:"" json:"unit_id"`                             // 关联农场单元ID
	WorkType    int            `gorm:"" json:"work_type"`                           // 工作类型(1=种植,2=养护,3=收获等)
	Title       string         `gorm:"size:128" json:"title"`                       // 日志标题
	Description string         `gorm:"type:text" json:"description"`                // 日志描述
	WorkerID    int            `gorm:"" json:"worker_id"`                           // 操作人员ID
	Weather     string         `gorm:"size:50" json:"weather"`                      // 天气情况
	Temperature string         `gorm:"size:20" json:"temperature"`                  // 温度
	ImageURLs   datatypes.JSON `gorm:"type:json" json:"image_urls"`                 // 图片列表
	WorkDate    time.Time      `gorm:"type:date" json:"work_date"`                  // 工作日期
	CreatedAt   time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"` // 创建时间
}
