package commentReplyModel

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ CommentReplyModel = (*customCommentReplyModel)(nil)

type (
	// CommentReplyModel is an interface to be customized, add more methods here,
	// and implement the added methods in customCommentReplyModel.
	CommentReplyModel interface {
		commentReplyModel
		withSession(session sqlx.Session) CommentReplyModel
	}

	customCommentReplyModel struct {
		*defaultCommentReplyModel
	}
)

// NewCommentReplyModel returns a model for the database table.
func NewCommentReplyModel(conn sqlx.SqlConn) CommentReplyModel {
	return &customCommentReplyModel{
		defaultCommentReplyModel: newCommentReplyModel(conn),
	}
}

func (m *customCommentReplyModel) withSession(session sqlx.Session) CommentReplyModel {
	return NewCommentReplyModel(sqlx.NewSqlConnFromSession(session))
}
