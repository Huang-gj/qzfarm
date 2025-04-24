package farm

import (
	"time"
	"gorm.io/datatypes"
)

// FarmManager 用于存储农场管理员信息
type FarmManager struct {
	ManagerID   int            `gorm:"primaryKey;autoIncrement" json:"manager_id"`  // 管理员ID
	FarmID      int            `gorm:"not null" json:"farm_id"`                     // 关联农场ID
	UserID      int            `gorm:"not null" json:"user_id"`                     // 关联用户ID
	Role        string         `gorm:"size:50" json:"role"`                         // 角色（如owner、manager、staff）
	Permissions datatypes.JSON `gorm:"type:json" json:"permissions"`                // 权限设置，JSON格式
	CreatedAt   time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"` // 创建时间
}
