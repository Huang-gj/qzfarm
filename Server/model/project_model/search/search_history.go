package search

import (
	"time"
)

// SearchHistory 用于存储用户的历史搜索记录
type SearchHistory struct {
	HistoryID  int       `gorm:"primaryKey;autoIncrement" json:"history_id"`   // 历史搜索记录ID
	UserID     int       `gorm:"index" json:"user_id"`                         // 用户ID
	SearchWord string    `gorm:"size:128" json:"search_word"`                  // 搜索词
	SearchTime time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"search_time"` // 搜索时间
	FarmID     int       `json:"farm_id"`                                      // 关联农场ID

}
