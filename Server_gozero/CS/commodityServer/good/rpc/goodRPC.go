package main

import (
	"flag"
	"fmt"

	"Server_gozero/CS/commodityServer/good/rpc/good"
	"Server_gozero/CS/commodityServer/good/rpc/internal/config"
	"Server_gozero/CS/commodityServer/good/rpc/internal/server"
	"Server_gozero/CS/commodityServer/good/rpc/internal/svc"

	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/core/service"
	"github.com/zeromicro/go-zero/zrpc"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

var configFile = flag.String("f", "CS/commodityServer/good/rpc/etc/good.yaml", "the config file")

func main() {
	flag.Parse()

	var c config.Config
	conf.MustLoad(*configFile, &c)
	ctx := svc.NewServiceContext(c)

	s := zrpc.MustNewServer(c.RpcServerConf, func(grpcServer *grpc.Server) {
		good.RegisterGoodServer(grpcServer, server.NewGoodServer(ctx))

		if c.Mode == service.DevMode || c.Mode == service.TestMode {
			reflection.Register(grpcServer)
		}
	})
	defer s.Stop()

	fmt.Printf("Starting rpc server at %s...\n", c.ListenOn)
	s.Start()
}
