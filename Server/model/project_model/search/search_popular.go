package search

import (
	"time"
)

// SearchPopular 用于存储热门搜索记录
type SearchPopular struct {
	PopularID      int       `gorm:"primaryKey;autoIncrement" json:"popular_id"`    // 热门搜索记录ID
	SearchWord     string    `gorm:"size:128" json:"search_word"`                   // 搜索词
	SearchCount    int       `gorm:"default:0" json:"search_count"`                 // 搜索次数
	LastUpdated    time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"last_updated"` // 最后更新时间
	FarmID         int       `json:"farm_id"`                                       // 关联农场ID
	IsFarmRelated  bool      `gorm:"default:false" json:"is_farm_related"`          // 是否与农场相关
	SeasonRelevant string    `gorm:"size:50" json:"season_relevant"`                // 与季节相关的字段
}
