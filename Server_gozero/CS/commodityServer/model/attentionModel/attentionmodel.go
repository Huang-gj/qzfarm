package attentionModel

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ AttentionModel = (*customAttentionModel)(nil)

type (
	// AttentionModel is an interface to be customized, add more methods here,
	// and implement the added methods in customAttentionModel.
	AttentionModel interface {
		attentionModel
		withSession(session sqlx.Session) AttentionModel
	}

	customAttentionModel struct {
		*defaultAttentionModel
	}
)

// NewAttentionModel returns a model for the database table.
func NewAttentionModel(conn sqlx.SqlConn) AttentionModel {
	return &customAttentionModel{
		defaultAttentionModel: newAttentionModel(conn),
	}
}

func (m *customAttentionModel) withSession(session sqlx.Session) AttentionModel {
	return NewAttentionModel(sqlx.NewSqlConnFromSession(session))
}
