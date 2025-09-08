package main

import (
	"flag"
	"fmt"

	"Server_gozero/master/ISender/rpc/ISender"
	"Server_gozero/master/ISender/rpc/internal/config"
	"Server_gozero/master/ISender/rpc/internal/server"
	"Server_gozero/master/ISender/rpc/internal/svc"

	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/core/service"
	"github.com/zeromicro/go-zero/zrpc"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

//var configFile = flag.String("f", "master/ISender/rpc/etc/isender.yaml", "the config file")

var configFile = flag.String("f", "/data/master_rpc/etc/isender.yaml", "the config file")

func main() {
	flag.Parse()

	var c config.Config
	conf.MustLoad(*configFile, &c)
	ctx := svc.NewServiceContext(c)

	s := zrpc.MustNewServer(c.RpcServerConf, func(grpcServer *grpc.Server) {
		ISender.RegisterIDServer(grpcServer, server.NewIDServer(ctx))

		if c.Mode == service.DevMode || c.Mode == service.TestMode {
			reflection.Register(grpcServer)
		}
	})
	defer s.Stop()

	fmt.Printf("Starting ISender server at %s...\n", c.ListenOn)
	s.Start()
}
