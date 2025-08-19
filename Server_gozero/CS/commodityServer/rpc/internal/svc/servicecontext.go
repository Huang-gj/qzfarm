package svc

import (
	"Server_gozero/CS/commodityServer/model/goodModel/model"
	model2 "Server_gozero/CS/commodityServer/model/landModel/model"
	"Server_gozero/CS/commodityServer/rpc/internal/config"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type ServiceContext struct {
	Config    config.Config
	GoodModel model.GoodModel
	LandModel model2.LandModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	conn := sqlx.NewMysql(c.Mysql.DataSource)
	return &ServiceContext{
		Config:    c,
		GoodModel: model.NewGoodModel(conn),
		LandModel: model2.NewLandModel(conn),
	}
}
