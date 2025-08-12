package svc

import (
	"Server_gozero/BS/model/SaleData"
	"Server_gozero/BS/rpc/internal/config"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type ServiceContext struct {
	Config   config.Config
	SaleData SaleData.SaleDataModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	sqlconn := sqlx.NewMysql(c.Mysql.DataSource)
	return &ServiceContext{
		Config:   c,
		SaleData: SaleData.NewSaleDataModel(sqlconn, c.CacheRedis),
	}
}
