package svc

import (
	"Server_gozero/BS/api/internal/config"
	"Server_gozero/BS/model/AdminModel"
	"Server_gozero/BS/model/CategoryModel"
	"Server_gozero/BS/model/FarmModel"
	"Server_gozero/BS/model/Order/GoodOrderModel"
	"Server_gozero/BS/model/Order/LandOrderModel"
	"Server_gozero/BS/model/Product/Good"
	"Server_gozero/BS/model/Product/Land"
	"Server_gozero/BS/model/SaleData"
	"Server_gozero/CS/commodityServer/model/activityModel"
	"Server_gozero/common/ISender/IDGenerator"
	"Server_gozero/common/ISender/id"
	"context"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
	"github.com/zeromicro/go-zero/zrpc"
)

type ServiceContext struct {
	Config         config.Config
	AdminModel     AdminModel.AdminModel
	FarmModel      FarmModel.FarmModel
	Ident          IDGenerator.Ident
	GoodOrderModel GoodOrderModel.GoodOrderModel
	LandOrderModel LandOrderModel.LandOrderModel
	GoodModel      Good.GoodModel
	LandModel      Land.LandModel
	SaleData       SaleData.SaleDataModel
	ActivityModel  activityModel.ActivityModel
	CategoryModel  CategoryModel.CategoryModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	sqlconn := sqlx.NewMysql(c.Mysql.DataSource)
	Ident, err := IDGenerator.NewIdent(context.Background(), id.NewID(zrpc.MustNewClient(c.IDRpc)))
	if err != nil {
		println(err.Error())
	}
	return &ServiceContext{
		Config:         c,
		AdminModel:     AdminModel.NewAdminModel(sqlconn),
		FarmModel:      FarmModel.NewFarmModel(sqlconn),
		Ident:          *Ident,
		GoodOrderModel: GoodOrderModel.NewGoodOrderModel(sqlconn),
		LandOrderModel: LandOrderModel.NewLandOrderModel(sqlconn),
		GoodModel:      Good.NewGoodModel(sqlconn),
		LandModel:      Land.NewLandModel(sqlconn),
		SaleData:       SaleData.NewSaleDataModel(sqlconn, c.CacheRedis),
		ActivityModel:  activityModel.NewActivityModel(sqlconn),
		CategoryModel:  CategoryModel.NewCategoryModel(sqlconn),
	}
}
