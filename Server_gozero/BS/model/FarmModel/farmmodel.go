package FarmModel

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ FarmModel = (*customFarmModel)(nil)

type (
	// FarmModel is an interface to be customized, add more methods here,
	// and implement the added methods in customFarmModel.
	FarmModel interface {
		farmModel
		withSession(session sqlx.Session) FarmModel
	}

	customFarmModel struct {
		*defaultFarmModel
	}
)

// NewFarmModel returns a model for the database table.
func NewFarmModel(conn sqlx.SqlConn) FarmModel {
	return &customFarmModel{
		defaultFarmModel: newFarmModel(conn),
	}
}

func (m *customFarmModel) withSession(session sqlx.Session) FarmModel {
	return NewFarmModel(sqlx.NewSqlConnFromSession(session))
}
