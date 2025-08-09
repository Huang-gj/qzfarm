package SaleData

import (
	"github.com/zeromicro/go-zero/core/stores/cache"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

var _ SaleDataModel = (*customSaleDataModel)(nil)

type (
	// SaleDataModel is an interface to be customized, add more methods here,
	// and implement the added methods in customSaleDataModel.
	SaleDataModel interface {
		saleDataModel
	}

	customSaleDataModel struct {
		*defaultSaleDataModel
	}
)

// NewSaleDataModel returns a model for the database table.
func NewSaleDataModel(conn sqlx.SqlConn, c cache.CacheConf, opts ...cache.Option) SaleDataModel {
	return &customSaleDataModel{
		defaultSaleDataModel: newSaleDataModel(conn, c, opts...),
	}
}
