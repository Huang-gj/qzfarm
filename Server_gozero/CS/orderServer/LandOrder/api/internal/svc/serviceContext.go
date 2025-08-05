package svc

import (
	"Server_gozero/CS/commodityServer/land/rpc/landclient"
	"Server_gozero/CS/orderServer/LandOrder/api/internal/config"
	"Server_gozero/CS/orderServer/LandOrder/model"
	"Server_gozero/common/ISender/IDGenerator"
	"Server_gozero/common/ISender/id"
	"context"
	"github.com/zeromicro/go-zero/core/stores/redis"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
	"github.com/zeromicro/go-zero/zrpc"
)

type ServiceContext struct {
	Config    config.Config
	Ident     IDGenerator.Ident
	LandOrder model.LandOrderModel
	LandRPC   landclient.Land
	RedisLock *redis.Redis
}

func NewServiceContext(c config.Config) *ServiceContext {
	Ident, err := IDGenerator.NewIdent(context.Background(), id.NewID(zrpc.MustNewClient(c.IDRpc)))
	sqlxConn := sqlx.NewMysql(c.Mysql.DataSource)
	rds, err := redis.NewRedis(redis.RedisConf{
		Host: c.RedisLockConf.Host,
		Type: c.RedisLockConf.Type,
	})
	if err != nil {
		panic("Redis 初始化失败: " + err.Error())
	}
	if err != nil {
		println(err.Error())
	}
	return &ServiceContext{
		Config:    c,
		Ident:     *Ident,
		LandOrder: model.NewLandOrderModel(sqlxConn),
		LandRPC:   landclient.NewLand(zrpc.MustNewClient(c.LandRPC)),
		RedisLock: rds,
	}
}
