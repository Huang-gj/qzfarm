package svc

import (
	"Server_gozero/master/ISender/model"
	"Server_gozero/master/ISender/rpc/internal/config"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type ServiceContext struct {
	Config  config.Config
	IDModel model.IdSenderModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	conn := sqlx.NewMysql(c.Mysql.DataSource)
	return &ServiceContext{
		Config:  c,
		IDModel: model.NewIdSenderModel(conn),
	}
}
