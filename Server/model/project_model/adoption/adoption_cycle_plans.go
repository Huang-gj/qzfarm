package adoption

import (
	"gorm.io/datatypes"
	"time"
)

// AdoptionCyclePlan 用于存储认养周期计划信息
type AdoptionCyclePlan struct {
	PlanID         int            `gorm:"primaryKey;autoIncrement" json:"plan_id"`     // 周期计划ID
	FarmID         int            `gorm:"not null" json:"farm_id"`                     // 关联农场ID
	UnitType       int            `json:"unit_type"`                                   // 单元类型
	ProductType    string         `gorm:"size:128" json:"product_type"`                // 产品类型
	CycleName      string         `gorm:"size:128" json:"cycle_name"`                  // 周期名称
	TotalDays      int            `json:"total_days"`                                  // 总天数
	Stages         datatypes.JSON `gorm:"type:json" json:"stages"`                     // 计划阶段，JSON格式
	ExpectedOutput string         `gorm:"size:128" json:"expected_output"`             // 预期产出
	CreatedAt      time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"` // 创建时间
}
