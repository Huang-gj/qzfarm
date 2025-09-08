package product

import (
	"context"
	"encoding/json"
	"errors"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetProductLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetProductLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetProductLogic {
	return &GetProductLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetProductLogic) GetProduct(req *types.GetProductRequest) (resp *types.GetProductResponse, err error) {
	// todo: add your logic here and delete this line
	switch req.ProductType {
	case 1:
		AllGoods, err := l.svcCtx.GoodModel.FindAllByFarmID(l.ctx, int64(req.FarmID))
		if err != nil {
			logx.Errorw("GetProduct failed", logx.Field("err", err))
			return &types.GetProductResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
		}

		goods := make([]*types.Good, len(AllGoods))
		for i, good := range AllGoods {
			var image []string
			err := json.Unmarshal(good.ImageUrls, &image)
			if err != nil {
				logx.Errorw("GetProduct failed", logx.Field("err", err))
				return &types.GetProductResponse{Code: 400, Msg: "反序列化失败"}, errors.New("反序列化失败")
			}
			goods[i] = &types.Good{
				GoodTag:    good.GoodTag,
				CreateTime: good.CreateTime.Format("2006-01-02 15:04:05"),
				GoodID:     int(good.GoodId),
				GoodName:   good.Title,
				FarmID:     req.FarmID,
				ImageURLs:  image,
				Price:      good.Price,
				Units:      good.Units,
				Repertory:  float64(good.Repertory),
				Detail:     good.Detail.String,
			}
		}
		resp = &types.GetProductResponse{
			Code: 200,
			Msg:  "查找成功",
			Good: goods,
		}
		return resp, nil

	case 2:
		AllLands, err := l.svcCtx.LandModel.FindAllByFarmID(l.ctx, int64(req.FarmID))
		if err != nil {
			logx.Errorw("GetProduct failed", logx.Field("err", err))
			return &types.GetProductResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
		}

		lands := make([]*types.Land, len(AllLands))
		for i, land := range AllLands {
			var image []string
			err := json.Unmarshal(land.ImageUrls, &image)
			if err != nil {
				logx.Errorw("GetProduct failed", logx.Field("err", err))
				return &types.GetProductResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
			}
			lands[i] = &types.Land{
				LandTag:    land.LandTag,
				CreateTime: land.CreateTime.Format("2006-01-02 15:04:05"),
				LandID:     int(land.LandId),
				FarmID:     req.FarmID,
				LandName:   land.LandName,
				Area:       land.Area,
				ImageURLs:  image,
				Price:      land.Price,
				Detail:     land.Detail.String,
				SaleStatus: int(land.SaleStatus),
				SaleTime:   land.SaleTime.Format("2006-01-02 15:04:05"),
			}
		}
		resp = &types.GetProductResponse{
			Code: 200,
			Msg:  "查找成功",
			Land: lands,
		}
		return resp, nil
	default:
		return &types.GetProductResponse{
			Code: 400,
			Msg:  "该编号不存在",
		}, nil
	}

}
