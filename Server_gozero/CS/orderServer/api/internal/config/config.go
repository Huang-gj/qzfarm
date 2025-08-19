package config

import (
	"github.com/zeromicro/go-zero/core/stores/redis"
	"github.com/zeromicro/go-zero/rest"
	"github.com/zeromicro/go-zero/zrpc"
)

type Config struct {
	rest.RestConf
	Auth struct {
		AccessSecret string
		AccessExpire int64
	}

	IDRpc zrpc.RpcClientConf // 连接其他微服务的RPC客户端

	BSRpc zrpc.RpcClientConf

	Mysql struct { // 数据库配置，除mysql外，可能还有mongo等其他数据库
		DataSource string // mysql链接地址，满足 $user:$password@tcp($ip:$port)/$db?$queries 格式即可
	}

	CommodityRPC zrpc.RpcClientConf

	RedisLockConf redis.RedisConf // 用于分布式锁
}
