package svc

import (
	"Server_gozero/CS/userServer/model/userModel"
	"Server_gozero/common/ISender/IDGenerator"
	"Server_gozero/common/ISender/id"
	"context"

	"api/internal/config"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
	"github.com/zeromicro/go-zero/zrpc"
)

type ServiceContext struct {
	Config    config.Config
	Ident     IDGenerator.Ident
	UserModel userModel.UserModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	Ident, err := IDGenerator.NewIdent(context.Background(), id.NewID(zrpc.MustNewClient(c.IDRpc)))
	if err != nil {
		println(err.Error())
	}
	sqlxConn := sqlx.NewMysql(c.Mysql.DataSource)
	return &ServiceContext{
		Config:    c,
		Ident:     *Ident,
		UserModel: userModel.NewUserModel(sqlxConn),
	}
}
