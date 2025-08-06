package svc

import (
	"Server_gozero/BS/api/internal/config"
	"Server_gozero/BS/model/AdminModel"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type ServiceContext struct {
	Config     config.Config
	AdminModel AdminModel.AdminModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	sqlconn := sqlx.NewMysql(c.Mysql.DataSource)
	return &ServiceContext{
		Config:     c,
		AdminModel: AdminModel.NewAdminModel(sqlconn),
	}
}
