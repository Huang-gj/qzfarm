package svc

import (
	"Server_gozero/CS/commodityServer/land/model"
	"Server_gozero/CS/commodityServer/land/rpc/internal/config"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type ServiceContext struct {
	Config    config.Config
	LandModel model.LandModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	conn := sqlx.NewMysql(c.Mysql.DataSource)
	return &ServiceContext{
		Config:    c,
		LandModel: model.NewLandModel(conn),
	}
}
