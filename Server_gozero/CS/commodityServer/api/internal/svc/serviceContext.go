package svc

import (
	"Server_gozero/CS/commodityServer/api/internal/config"
	"Server_gozero/CS/commodityServer/model/commentModel"
	"Server_gozero/CS/commodityServer/model/commentReplyModel"
	"Server_gozero/CS/commodityServer/model/goodModel/model"
	model2 "Server_gozero/CS/commodityServer/model/landModel/model"
	"Server_gozero/common/ISender/IDGenerator"
	"Server_gozero/common/ISender/id"
	"context"
	"fmt"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
	"github.com/zeromicro/go-zero/zrpc"
)

type ServiceContext struct {
	Config            config.Config
	GoodModel         model.GoodModel
	LandModel         model2.LandModel
	Ident             IDGenerator.Ident
	CommentModel      commentModel.CommentModel
	CommentReplyModel commentReplyModel.CommentReplyModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	sqlxConn := sqlx.NewMysql(c.Mysql.DataSource)
	Ident, err := IDGenerator.NewIdent(context.Background(), id.NewID(zrpc.MustNewClient(c.IDRpc)))
	if err != nil {
		panic(fmt.Sprintf("初始化ID生成器失败: %v", err))
	}
	return &ServiceContext{
		Config:            c,
		GoodModel:         model.NewGoodModel(sqlxConn),
		LandModel:         model2.NewLandModel(sqlxConn),
		Ident:             *Ident,
		CommentModel:      commentModel.NewCommentModel(sqlxConn),
		CommentReplyModel: commentReplyModel.NewCommentReplyModel(sqlxConn),
	}
}
