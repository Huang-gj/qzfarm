package svc

import (
	"Server_gozero/CS/common/ISender/IDGenerator"
	"Server_gozero/CS/orderServer/GoodOrder/api/internal/config"
	"Server_gozero/CS/orderServer/GoodOrder/model"
	"context"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
	"github.com/zeromicro/go-zero/zrpc"

	"Server_gozero/CS/common/ISender/id"
)

type ServiceContext struct {
	Config    config.Config
	Ident     IDGenerator.Ident
	GoodOrder model.GoodOrderModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	sqlxConn := sqlx.NewMysql(c.Mysql.DataSource)
	Ident, err := IDGenerator.NewIdent(context.Background(), id.NewID(zrpc.MustNewClient(c.IDRpc)))
	if err != nil {
		println(err.Error())
	}
	return &ServiceContext{
		Config:    c,
		Ident:     *Ident,
		GoodOrder: model.NewGoodOrderModel(sqlxConn),
	}
}
