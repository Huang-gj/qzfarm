package good

import (
	"context"
	"encoding/json"
	"errors"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetGoodsByFarmIDLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetGoodsByFarmIDLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetGoodsByFarmIDLogic {
	return &GetGoodsByFarmIDLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetGoodsByFarmIDLogic) GetGoodsByFarmID(req *types.GetGoodsByFarmIDRequest) (resp *types.GetGoodsByFarmIDResponse, err error) {
	// todo: add your logic here and delete this line
	allGoods, err := l.svcCtx.GoodModel.FindAllByFarmID(l.ctx, int64(req.FarmID))
	if err != nil {
		logx.Errorw("getAllGoods_FindAll failed", logx.Field("err", err))
		return &types.GetGoodsByFarmIDResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}

	goods := make([]*types.Good, len(allGoods))
	for i, good := range allGoods {
		var images []string
		err = json.Unmarshal(good.ImageUrls, &images)

		goods[i] = &types.Good{
			Id:         good.Id,
			DelState:   good.DelState,
			DelTime:    good.DelTime.Format("2006-01-02 15:04:05"),
			CreateTime: good.CreateTime.Format("2006-01-02 15:04:05"),
			GoodId:     good.GoodId,
			Title:      good.Title,
			GoodTag:    good.GoodTag,
			FarmId:     good.FarmId,
			ImageUrls:  images,
			Price:      good.Price,
			Units:      good.Units,
			Repertory:  float64(good.Repertory),
			Detail:     good.Detail.String,
		}
	}
	resp = &types.GetGoodsByFarmIDResponse{
		Code:  200,
		Msg:   "查找成功",
		Goods: goods,
	}
	return resp, nil
}
