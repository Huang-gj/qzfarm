package activity

import (
	"gorm.io/datatypes" // 添加 datatypes 包导入
)

// PromotionActivity 用于存储促销活动信息
type PromotionActivity struct {
	PromotionID      int            `gorm:"primaryKey;autoIncrement" json:"promotion_id"` // 促销活动ID
	Title            string         `gorm:"size:128" json:"title"`                        // 促销活动标题
	Description      string         `gorm:"type:text" json:"description"`                 // 促销活动描述
	PromotionCode    string         `gorm:"size:128" json:"promotion_code"`               // 促销代码
	PromotionSubCode string         `gorm:"size:128" json:"promotion_sub_code"`           // 促销子代码
	Tag              string         `gorm:"size:50" json:"tag"`                           // 促销活动标签
	TimeType         int            `json:"time_type"`                                    // 时间类型（1=固定时间，其他可扩展）
	StartTime        int64          `gorm:"type:bigint" json:"start_time"`                // 活动开始时间（毫秒级时间戳）
	EndTime          int64          `gorm:"type:bigint" json:"end_time"`                  // 活动结束时间（毫秒级时间戳）
	TeasingStartTime int64          `gorm:"type:bigint" json:"teasing_start_time"`        // 预热开始时间（毫秒级时间戳）
	ActivityLadder   datatypes.JSON `gorm:"type:json" json:"activity_ladder"`             // 活动阶梯（JSON格式）
	FarmID           int            `json:"farm_id"`                                      // 关联农场ID
	IsFarmActivity   bool           `gorm:"default:false" json:"is_farm_activity"`        // 是否为农场促销活动
	FarmActivityType int            `json:"farm_activity_type"`                           // 农场活动类型
	FarmAreaIDs      datatypes.JSON `gorm:"type:json" json:"farm_area_ids"`               // 关联农场区域ID
}
