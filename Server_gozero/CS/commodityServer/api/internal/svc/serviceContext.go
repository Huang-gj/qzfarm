package svc

import (
	"Server_gozero/CS/commodityServer/api/internal/config"
	"Server_gozero/CS/commodityServer/model/goodModel/model"
	model2 "Server_gozero/CS/commodityServer/model/landModel/model"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type ServiceContext struct {
	Config    config.Config
	GoodModel model.GoodModel
	LandModel model2.LandModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	sqlxConn := sqlx.NewMysql(c.Mysql.DataSource)
	return &ServiceContext{
		Config:    c,
		GoodModel: model.NewGoodModel(sqlxConn),
		LandModel: model2.NewLandModel(sqlxConn),
	}
}
