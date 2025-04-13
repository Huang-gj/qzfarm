package adoption

import (
	"time"
	"gorm.io/datatypes"
)

// AdoptionOrder 用于存储认养订单信息
type AdoptionOrder struct {
	AdoptionID          int            `gorm:"primaryKey;autoIncrement" json:"adoption_id"` // 认养订单ID
	UserID              int            `json:"user_id"`                                     // 用户ID
	FarmID              int            `gorm:"not null" json:"farm_id"`                     // 关联农场ID
	UnitID              int            `json:"unit_id"`                                     // 关联农场单元ID
	StartDate           time.Time      `json:"start_date"`                                  // 认养开始日期
	EndDate             time.Time      `json:"end_date"`                                    // 认养结束日期
	TotalDays           int            `json:"total_days"`                                  // 认养总天数
	TotalAmount         float64        `gorm:"type:decimal(10,2)" json:"total_amount"`      // 总金额
	PaymentStatus       int            `json:"payment_status"`                              // 支付状态（如已支付、未支付）
	AdoptionStatus      int            `json:"adoption_status"`                             // 认养状态（如进行中、已完成）
	PlantSelection      datatypes.JSON `gorm:"type:json" json:"plant_selection"`            // 选择的作物种类，JSON格式
	FishSelection       datatypes.JSON `gorm:"type:json" json:"fish_selection"`             // 选择的养殖品种，JSON格式
	SpecialRequirements string         `gorm:"type:text" json:"special_requirements"`       // 特殊要求
	CreatedAt           time.Time      `json:"created_at"`                                  // 创建时间
	UpdatedAt           time.Time      `json:"updated_at"`                                  // 更新时间
}
