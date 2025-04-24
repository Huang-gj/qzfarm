package comment

// CommentMedia 用于存储评论中的媒体资源信息，如图片或视频
type CommentMedia struct {
	MediaID   int    `gorm:"primaryKey;autoIncrement" json:"media_id"` // 媒体资源ID
	CommentID int    `gorm:"index" json:"comment_id"`                  // 关联评论ID
	MediaURL  string `gorm:"size:512;not null" json:"media_url"`       // 媒体资源URL（图片/视频）
}
