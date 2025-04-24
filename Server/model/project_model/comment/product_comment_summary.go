package comment

import (
	"time"
)

type ProductCommentSummary struct {
	SummaryID      int       `gorm:"primaryKey;autoIncrement" json:"summary_id"` // 评论汇总记录ID
	ProductID      int       `json:"product_id"`                                 // 商品ID
	OrderNo        string    `gorm:"size:128" json:"order_no"`                   // 订单号
	LogisticsScore int       `json:"logistics_score"`                            // 物流评分
	ServiceScore   int       `json:"service_score"`                              // 服务评分
	CreatedAt      time.Time `gorm:"autoCreateTime" json:"created_at"`           // 创建时间
	FarmID         int       `json:"farm_id"`                                    // 关联农场ID
}
