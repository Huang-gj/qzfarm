package userServer

import (
	"Server/logic/userLogic"
	"Server/middleware"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"net/http"
)

type Version struct {
	Version string `json:"version"`
}

func UserServer(port string) {

	r := gin.Default()
	r.Use(middleware.CORS())
	// 定义一个端点来获取版本信息
	r.GET("/getVersion", func(ctx *gin.Context) {
		serverVersion := viper.GetString("datasource.version")
		// 返回服务器版本号
		ctx.JSON(http.StatusOK, Version{Version: serverVersion})
	})
	// 拿到用户名密码之后验证进行登录
	r.POST("/userLogin", func(ctx *gin.Context) {
		userLogic.Login(ctx)
	})

	// 创建新账号
	r.POST("/userRegister", func(ctx *gin.Context) {
		userLogic.Register(ctx)
	})

	// 启动服务器
	r.Run(":" + port)
}
