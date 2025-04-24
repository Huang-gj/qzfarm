package search

import (
	"time"
	"gorm.io/datatypes"
)

// SearchResult 用于存储搜索结果记录
type SearchResult struct {
	ResultID    int            `gorm:"primaryKey;autoIncrement" json:"result_id"`    // 搜索结果ID
	SaaSID      string         `gorm:"size:128" json:"saas_id"`                      // SaaS ID
	PageNum     int            `gorm:"default:1" json:"page_num"`                    // 当前页码
	PageSize    int            `gorm:"default:30" json:"page_size"`                  // 每页显示的记录数
	TotalCount  int            `json:"total_count"`                                  // 总记录数
	AlgID       int            `gorm:"default:0" json:"alg_id"`                      // 算法ID
	ProductList datatypes.JSON `gorm:"type:json" json:"product_list"`                // 商品列表，JSON格式
	SearchTime  time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"search_time"` // 搜索时间
	FarmID      int            `json:"farm_id"`                                      // 关联农场ID
}
