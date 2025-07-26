package svc

import (
	"Server_gozero/CS/commodityServer/good/api/internal/config"
	"Server_gozero/CS/commodityServer/good/model"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type ServiceContext struct {
	Config    config.Config
	GoodModel model.GoodModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	sqlxConn := sqlx.NewMysql(c.Mysql.DataSource)
	return &ServiceContext{
		Config:    c,
		GoodModel: model.NewGoodModel(sqlxConn),
	}
}
