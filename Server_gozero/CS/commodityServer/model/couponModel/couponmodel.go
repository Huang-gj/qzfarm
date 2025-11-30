package couponModel

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ CouponModel = (*customCouponModel)(nil)

type (
	// CouponModel is an interface to be customized, add more methods here,
	// and implement the added methods in customCouponModel.
	CouponModel interface {
		couponModel
		withSession(session sqlx.Session) CouponModel
	}

	customCouponModel struct {
		*defaultCouponModel
	}
)

// NewCouponModel returns a model for the database table.
func NewCouponModel(conn sqlx.SqlConn) CouponModel {
	return &customCouponModel{
		defaultCouponModel: newCouponModel(conn),
	}
}

func (m *customCouponModel) withSession(session sqlx.Session) CouponModel {
	return NewCouponModel(sqlx.NewSqlConnFromSession(session))
}
