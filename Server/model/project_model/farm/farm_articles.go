package farm

import (
	"time"
	"gorm.io/datatypes"
)

// FarmArticle 用于存储农场资讯文章信息
type FarmArticle struct {
	ArticleID   int            `gorm:"primaryKey;autoIncrement" json:"article_id"`    // 文章ID
	FarmID      int            `gorm:"not null" json:"farm_id"`                       // 关联农场ID
	Title       string         `gorm:"size:128;not null" json:"title"`                // 文章标题
	Content     string         `gorm:"type:text" json:"content"`                      // 文章内容
	AuthorID    int            `gorm:"" json:"author_id"`                             // 作者ID
	CoverImage  string         `gorm:"size:512" json:"cover_image"`                   // 封面图片
	PublishTime time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"publish_time"` // 发布时间
	ViewCount   int            `gorm:"default:0" json:"view_count"`                   // 浏览次数
	Status      int            `gorm:"default:1" json:"status"`                       // 状态(1=已发布,0=草稿)
	Tags        datatypes.JSON `gorm:"type:json" json:"tags"`                         // 标签，JSON格式
}
