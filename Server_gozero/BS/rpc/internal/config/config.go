package config

import (
	"github.com/zeromicro/go-zero/core/stores/cache"
	"github.com/zeromicro/go-zero/zrpc"
)

type Config struct {
	zrpc.RpcServerConf
	Mysql struct { // 数据库配置，除mysql外，可能还有mongo等其他数据库
		DataSource string
	}
	// redis
	CacheRedis cache.CacheConf
}
