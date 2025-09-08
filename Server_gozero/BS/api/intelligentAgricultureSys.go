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

//var configFile = flag.String("f", "BS/api/etc/intelligentAgricultureSys.yaml", "the config file")

var configFile = flag.String("f", "/data/BS_api/etc/intelligentAgricultureSys.yaml", "the config file")

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
	//var images []string = []string{
	//	"D:/Work_Materials/QZFarm/Images/lands_image_url/池塘.jpg",
	//	"D:/Work_Materials/QZFarm/Images/lands_image_url/果树.jpg",
	//	"D:/Work_Materials/QZFarm/Images/lands_image_url/土地.jpg",
	//}
	//common.BatchUploadPictures(images, "images/lands_image_url")
	fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
	server.Start()
}
