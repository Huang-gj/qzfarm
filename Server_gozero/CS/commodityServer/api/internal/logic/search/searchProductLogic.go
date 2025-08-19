package search

import (
	"context"
	"encoding/json"
	"errors"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type SearchProductLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewSearchProductLogic(ctx context.Context, svcCtx *svc.ServiceContext) *SearchProductLogic {
	return &SearchProductLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *SearchProductLogic) SearchProduct(req *types.SearchProductRequest) (resp *types.SearchProductResponse, err error) {
	// todo: add your logic here and delete this line
	Goods, err := l.svcCtx.GoodModel.FindAllByKeyword(l.ctx, req.KeyWord)
	if err != nil {
		logx.Errorw("Goods FindAllByKeyword failed", logx.Field("err", err))
		return &types.SearchProductResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	var goods []*types.Good
	for _, Good := range Goods {
		var images []string
		err = json.Unmarshal(Good.ImageUrls, &images)
		goods = append(goods, &types.Good{
			Id:         Good.Id,
			DelState:   Good.DelState,
			DelTime:    Good.DelTime.Format("2006-01-02 15:04:05"),
			CreateTime: Good.CreateTime.Format("2006-01-02 15:04:05"),
			GoodId:     Good.GoodId,
			Title:      Good.Title,
			GoodTag:    Good.GoodTag,
			FarmId:     Good.FarmId,
			ImageUrls:  images,
			Price:      Good.Price,
			Units:      Good.Units,
			Repertory:  float64(Good.Repertory),
			Detail:     Good.Detail.String,
		})
	}

	Lands, err := l.svcCtx.LandModel.GetLandByKeyword(l.ctx, req.KeyWord)
	if err != nil {
		logx.Errorw("Lands FindAllByKeyword failed", logx.Field("err", err))
		return &types.SearchProductResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	var lands []*types.Land
	for _, Land := range Lands {
		var images []string
		err = json.Unmarshal(Land.ImageUrls, &images)
		lands = append(lands, &types.Land{
			Id:         Land.Id,
			DelState:   Land.DelState,
			DelTime:    Land.DelTime.Format("2006-01-02 15:04:05"),
			CreateTime: Land.CreateTime.Format("2006-01-02 15:04:05"),
			LandId:     Land.LandId,
			FarmId:     Land.FarmId,
			LandName:   Land.LandName,
			LandTag:    Land.LandTag,
			Area:       Land.Area,
			ImageUrls:  images,
			Price:      Land.Price,
			Detail:     Land.Detail.String,
			SaleStatus: Land.SaleStatus,
			SaleTime:   Land.SaleTime.Format("2006-01-02 15:04:05"),
		})
	}
	return &types.SearchProductResponse{
		Code:  200,
		Msg:   "搜索成功",
		Goods: goods,
		Lands: lands,
	}, nil
}
