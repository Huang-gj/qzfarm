package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ IdSenderModel = (*customIdSenderModel)(nil)

type (
	// IdSenderModel is an interface to be customized, add more methods here,
	// and implement the added methods in customIdSenderModel.
	IdSenderModel interface {
		idSenderModel
		withSession(session sqlx.Session) IdSenderModel
	}

	customIdSenderModel struct {
		*defaultIdSenderModel
	}
)

// NewIdSenderModel returns a model for the database table.
func NewIdSenderModel(conn sqlx.SqlConn) IdSenderModel {
	return &customIdSenderModel{
		defaultIdSenderModel: newIdSenderModel(conn),
	}
}

func (m *customIdSenderModel) withSession(session sqlx.Session) IdSenderModel {
	return NewIdSenderModel(sqlx.NewSqlConnFromSession(session))
}
