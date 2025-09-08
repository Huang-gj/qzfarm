package main

import (
	"flag"
	"fmt"

	"Server_gozero/CS/commodityServer/api/internal/config"
	"Server_gozero/CS/commodityServer/api/internal/handler"
	"Server_gozero/CS/commodityServer/api/internal/svc"

	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/rest"
)

//var configFile = flag.String("f", "CS/commodityServer/api/etc/commodity.yaml", "the config file")

var configFile = flag.String("f", "/data/commodityServer_api/etc/commodity.yaml", "the config file")

func main() {
	flag.Parse()

	var c config.Config
	conf.MustLoad(*configFile, &c)

	server := rest.MustNewServer(c.RestConf)
	defer server.Stop()

	ctx := svc.NewServiceContext(c)
	handler.RegisterHandlers(server, ctx)

	fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
	server.Start()
}
