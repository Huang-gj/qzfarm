package main

import (
	"flag"
	"fmt"

	"Server_gozero/BS/api/internal/config"
	"Server_gozero/BS/api/internal/handler"
	"Server_gozero/BS/api/internal/middleware"
	"Server_gozero/BS/api/internal/svc"

	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/rest"
)

var configFile = flag.String("f", "BS/api/etc/intelligentAgricultureSys.yaml", "the config file")

func main() {
	flag.Parse()

	var c config.Config
	conf.MustLoad(*configFile, &c)

	server := rest.MustNewServer(c.RestConf)
	defer server.Stop()

	// 添加CORS中间件
	server.Use(middleware.CorsMiddleware)

	ctx := svc.NewServiceContext(c)
	handler.RegisterHandlers(server, ctx)

	fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
	server.Start()
}
