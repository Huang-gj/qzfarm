package comment

// CommentReply 用于存储评论的回复信息
type CommentReply struct {
	ReplyID      int    `gorm:"primaryKey;autoIncrement" json:"reply_id"` // 回复记录ID
	CommentID    int    `gorm:"index" json:"comment_id"`                  // 关联评论ID
	ReplyContent string `gorm:"type:text" json:"reply_content"`           // 回复内容
	ReplyUserID  int    `gorm:"index" json:"reply_user_id"`               // 回复用户ID（商家或用户）
	ReplyTime    int64  `gorm:"type:bigint" json:"reply_time"`            // 回复时间（毫秒级时间戳）
}
