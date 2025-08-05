package svc

import (
	"Server_gozero/CS/commodityServer/good/rpc/goodclient"
	"Server_gozero/CS/orderServer/GoodOrder/api/internal/config"
	"Server_gozero/CS/orderServer/GoodOrder/model"
	"Server_gozero/common/ISender/IDGenerator"
	"Server_gozero/common/ISender/id"
	"context"
	"fmt"
	"github.com/zeromicro/go-zero/core/stores/redis"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
	"github.com/zeromicro/go-zero/zrpc"
)

type ServiceContext struct {
	Config    config.Config
	Ident     IDGenerator.Ident
	GoodOrder model.GoodOrderModel
	GoodRPC   goodclient.Good
	RedisLock *redis.Redis
}

func NewServiceContext(c config.Config) *ServiceContext {
	sqlxConn := sqlx.NewMysql(c.Mysql.DataSource)
	Ident, err := IDGenerator.NewIdent(context.Background(), id.NewID(zrpc.MustNewClient(c.IDRpc)))
	if err != nil {
		panic(fmt.Sprintf("初始化ID生成器失败: %v", err))
	}

	// 改进Redis连接初始化
	var rds *redis.Redis
	maxRetries := 5
	for i := 0; i < maxRetries; i++ {
		rds, err = redis.NewRedis(redis.RedisConf{
			Host:        c.RedisLockConf.Host,
			Type:        c.RedisLockConf.Type,
			Pass:        c.RedisLockConf.Pass,
			NonBlock:    c.RedisLockConf.NonBlock,
			PingTimeout: c.RedisLockConf.PingTimeout,
		})

	}

	if err != nil {
		panic(fmt.Sprintf("Redis连接失败: %v", err))
	}

	return &ServiceContext{
		Config:    c,
		Ident:     *Ident,
		GoodOrder: model.NewGoodOrderModel(sqlxConn),
		GoodRPC:   goodclient.NewGood(zrpc.MustNewClient(c.GoodRPC)),
		RedisLock: rds,
	}
}
