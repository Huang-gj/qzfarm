package svc

import (
	BS "Server_gozero/BS/rpc/bs"
	"Server_gozero/CS/commodityServer/rpc/commodityclient"
	"Server_gozero/CS/orderServer/api/internal/config"
	"Server_gozero/CS/orderServer/model/GoodOrderModel"
	"Server_gozero/CS/orderServer/model/LandOrderModel"
	"Server_gozero/common/ISender/IDGenerator"
	"Server_gozero/common/ISender/id"
	"context"
	"fmt"
	"github.com/zeromicro/go-zero/core/stores/redis"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
	"github.com/zeromicro/go-zero/zrpc"
)

type ServiceContext struct {
	Config       config.Config
	Ident        IDGenerator.Ident
	GoodOrder    GoodOrderModel.GoodOrderModel
	LandOrder    LandOrderModel.LandOrderModel
	CommodityRPC commodityclient.Commodity
	BsRpc        BS.BS
	RedisLock    *redis.Redis
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
		Config:       c,
		Ident:        *Ident,
		GoodOrder:    GoodOrderModel.NewGoodOrderModel(sqlxConn),
		LandOrder:    LandOrderModel.NewLandOrderModel(sqlxConn),
		CommodityRPC: commodityclient.NewCommodity(zrpc.MustNewClient(c.CommodityRPC)),
		BsRpc:        BS.NewBS(zrpc.MustNewClient(c.BSRpc)),
		RedisLock:    rds,
	}
}
