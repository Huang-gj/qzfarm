package LandOrderModel

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ LandOrderModel = (*customLandOrderModel)(nil)

type (
	// LandOrderModel is an interface to be customized, add more methods here,
	// and implement the added methods in customLandOrderModel.
	LandOrderModel interface {
		landOrderModel
		withSession(session sqlx.Session) LandOrderModel
	}

	customLandOrderModel struct {
		*defaultLandOrderModel
	}
)

// NewLandOrderModel returns a model for the database table.
func NewLandOrderModel(conn sqlx.SqlConn) LandOrderModel {
	return &customLandOrderModel{
		defaultLandOrderModel: newLandOrderModel(conn),
	}
}

func (m *customLandOrderModel) withSession(session sqlx.Session) LandOrderModel {
	return NewLandOrderModel(sqlx.NewSqlConnFromSession(session))
}
