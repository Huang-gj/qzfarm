package svc

import (
	"Server_gozero/CS/common/ISender/IDGenerator"
	"Server_gozero/CS/common/ISender/id"
	"Server_gozero/CS/orderServer/LandOrder/api/internal/config"
	"Server_gozero/CS/orderServer/LandOrder/model"
	"context"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
	"github.com/zeromicro/go-zero/zrpc"
)

type ServiceContext struct {
	Config    config.Config
	Ident     IDGenerator.Ident
	LandOrder model.LandOrderModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	Ident, err := IDGenerator.NewIdent(context.Background(), id.NewID(zrpc.MustNewClient(c.IDRpc)))
	sqlxConn := sqlx.NewMysql(c.Mysql.DataSource)
	if err != nil {
		println(err.Error())
	}
	return &ServiceContext{
		Config:    c,
		Ident:     *Ident,
		LandOrder: model.NewLandOrderModel(sqlxConn),
	}
}
