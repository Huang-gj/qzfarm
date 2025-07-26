package svc

import (
	"Server_gozero/CS/commodityServer/land/api/internal/config"
	"Server_gozero/CS/commodityServer/land/model"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type ServiceContext struct {
	Config    config.Config
	LandModel model.LandModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	sqlxConn := sqlx.NewMysql(c.Mysql.DataSource)
	return &ServiceContext{
		Config:    c,
		LandModel: model.NewLandModel(sqlxConn),
	}
}
