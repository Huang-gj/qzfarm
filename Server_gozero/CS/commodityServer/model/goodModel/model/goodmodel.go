package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ GoodModel = (*customGoodModel)(nil)

type (
	// GoodModel is an interface to be customized, add more methods here,
	// and implement the added methods in customGoodModel.
	GoodModel interface {
		goodModel
		withSession(session sqlx.Session) GoodModel
	}

	customGoodModel struct {
		*defaultGoodModel
	}
)

// NewGoodModel returns a model for the database table.
func NewGoodModel(conn sqlx.SqlConn) GoodModel {
	return &customGoodModel{
		defaultGoodModel: newGoodModel(conn),
	}
}

func (m *customGoodModel) withSession(session sqlx.Session) GoodModel {
	return NewGoodModel(sqlx.NewSqlConnFromSession(session))
}
