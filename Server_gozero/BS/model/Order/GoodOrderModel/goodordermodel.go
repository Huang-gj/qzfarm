package GoodOrderModel

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ GoodOrderModel = (*customGoodOrderModel)(nil)

type (
	// GoodOrderModel is an interface to be customized, add more methods here,
	// and implement the added methods in customGoodOrderModel.
	GoodOrderModel interface {
		goodOrderModel
		withSession(session sqlx.Session) GoodOrderModel
	}

	customGoodOrderModel struct {
		*defaultGoodOrderModel
	}
)

// NewGoodOrderModel returns a model for the database table.
func NewGoodOrderModel(conn sqlx.SqlConn) GoodOrderModel {
	return &customGoodOrderModel{
		defaultGoodOrderModel: newGoodOrderModel(conn),
	}
}

func (m *customGoodOrderModel) withSession(session sqlx.Session) GoodOrderModel {
	return NewGoodOrderModel(sqlx.NewSqlConnFromSession(session))
}
