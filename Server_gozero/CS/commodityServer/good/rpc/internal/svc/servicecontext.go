package svc

import (
	"Server_gozero/CS/commodityServer/good/model"
	"Server_gozero/CS/commodityServer/good/rpc/internal/config"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type ServiceContext struct {
	Config    config.Config
	GoodModel model.GoodModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	conn := sqlx.NewMysql(c.Mysql.DataSource)
	return &ServiceContext{
		Config:    c,
		GoodModel: model.NewGoodModel(conn),
	}
}
