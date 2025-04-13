package main

import (
	"Server/logic"
	"Server/servers"
	"Server/servers/userServer"
	"fmt"
	"github.com/spf13/viper"
	"os"
)

func main() {
	InitConfig()
	servers.NewServiceContext(logic.InitDB())
	go userServer.UserServer(viper.GetString("userServer.port"))

	select {}
}

func InitConfig() {

	workDir, _ := os.Getwd()                 //获取目录对应的路径
	viper.SetConfigName("config")            //配置文件名
	viper.SetConfigType("yml")               //配置文件类型
	viper.AddConfigPath(workDir + "/config") //执行单文件运行，
	fmt.Println("Added config path:", workDir+"/config")

	err := viper.ReadInConfig()
	if err != nil {
		panic(err)
	}

}
