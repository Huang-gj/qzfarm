package comment

import (
	"gorm.io/datatypes"
	"time"
)

type ProductComment struct {
	ID                      int            `gorm:"primaryKey;autoIncrement" json:"id"`   // 评论ID
	SummaryID               int            `json:"summary_id"`                           // 关联商品评论汇总表ID
	UID                     int            `json:"uid"`                                  // 用户ID
	UserName                string         `gorm:"size:128" json:"user_name"`            // 用户名
	UserHeadURL             string         `gorm:"size:512" json:"user_head_url"`        // 用户头像URL
	ProductName             string         `gorm:"size:128" json:"product_name"`         // 被评论的商品名称
	CommentIDImageURL       string         `gorm:"size:512" json:"comment_id_image_url"` // 被评论的商品图片URL
	CommentStage            int            `json:"comment_stage"`                        // 评论阶段
	CommentCheckStatus      int            `json:"comment_check_status"`                 // 审核状态
	CommentIDType           int            `json:"comment_id_type"`                      // 评论类型
	Content                 string         `gorm:"type:text" json:"content"`             // 评论内容
	IsAgainComment          bool           `json:"is_again_comment"`                     // 是否为追加评论
	CommentHasAgainComment  bool           `json:"comment_has_again_comment"`            // 是否允许追加评论
	IsAnonymous             bool           `json:"is_anonymous"`                         // 是否匿名评论
	Specification           string         `gorm:"size:128" json:"specification"`        // 商品规格文本
	SpecificationJSON       datatypes.JSON `gorm:"type:json" json:"specification_json"`  // 商品规格的JSON结构
	CommentExtendID         string         `gorm:"size:128" json:"comment_extend_id"`    // 扩展评论ID
	CommentTime             int64          `json:"comment_time"`                         // 评论时间（毫秒级时间戳）
	Score                   int            `json:"score"`                                // 综合评分
	GoodsScore              int            `json:"goods_score"`                          // 商品质量评分
	FreightScore            int            `json:"freight_score"`                        // 物流服务评分
	ServiceScoreComment     int            `json:"service_score_comment"`                // 商家服务评分
	FarmID                  int            `json:"farm_id"`                              // 关联农场ID
	FarmUnitID              int            `json:"farm_unit_id"`                         // 认养单元ID
	AdoptionExperienceScore int            `json:"adoption_experience_score"`            // 认养体验评分
	FarmServiceScore        int            `json:"farm_service_score"`                   // 农场服务评分
	CreatedAt               time.Time      `gorm:"autoCreateTime" json:"created_at"`     // 创建时间
}

func (ProductComment) TableName() string {
	return "product_comments"
}
