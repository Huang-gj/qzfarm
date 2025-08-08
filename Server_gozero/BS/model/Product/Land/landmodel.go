package Land

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ LandModel = (*customLandModel)(nil)

type (
	// LandModel is an interface to be customized, add more methods here,
	// and implement the added methods in customLandModel.
	LandModel interface {
		landModel
		withSession(session sqlx.Session) LandModel
	}

	customLandModel struct {
		*defaultLandModel
	}
)

// NewLandModel returns a model for the database table.
func NewLandModel(conn sqlx.SqlConn) LandModel {
	return &customLandModel{
		defaultLandModel: newLandModel(conn),
	}
}

func (m *customLandModel) withSession(session sqlx.Session) LandModel {
	return NewLandModel(sqlx.NewSqlConnFromSession(session))
}
