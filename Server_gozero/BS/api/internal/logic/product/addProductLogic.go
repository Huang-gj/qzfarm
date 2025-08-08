package product

import (
	"Server_gozero/BS/model/Product/Good"
	"Server_gozero/BS/model/Product/Land"
	"Server_gozero/common/ISender/ISender"
	"context"
	"database/sql"
	"errors"
	"time"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type AddProductLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewAddProductLogic(ctx context.Context, svcCtx *svc.ServiceContext) *AddProductLogic {
	return &AddProductLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *AddProductLogic) AddProduct(req *types.AddProductRequest) (resp *types.AddProductResponse, err error) {
	// todo: add your logic here and delete this line
	switch req.ProductType {
	case 1:
		for _, good := range req.Good {
			goodId, err := l.svcCtx.Ident.GetId(l.ctx, &ISender.GetIDReq{BizTag: "good"})
			if err != nil {
				logx.Errorw("AddProduct GetID failed", logx.Field("err", err))
				return &types.AddProductResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
			}
			_, err = l.svcCtx.GoodModel.Insert(l.ctx, &Good.Good{
				DelTime:    time.Now(),
				CreateTime: time.Now(),
				GoodId:     goodId,
				Title:      good.GoodName,
				GoodTag:    good.GoodTag,
				FarmId:     int64(req.FarmID),
				ImageUrls:  good.ImageURLs,
				Price:      good.Price,
				Units:      good.Units,
				Repertory:  int64(good.Repertory),
				Detail:     sql.NullString{good.Detail, good.Detail != ""},
			})
		}

		return &types.AddProductResponse{
			Code: 200,
			Msg:  "新增成功",
		}, nil
	case 2:
		for _, land := range req.Land {
			landId, err := l.svcCtx.Ident.GetId(l.ctx, &ISender.GetIDReq{BizTag: "land"})
			if err != nil {
				logx.Errorw("AddProduct GetID failed", logx.Field("err", err))
				return &types.AddProductResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
			}
			_, err = l.svcCtx.LandModel.Insert(l.ctx, &Land.Land{

				DelTime:    time.Now(),
				CreateTime: time.Now(),
				LandId:     landId,
				FarmId:     int64(req.FarmID),
				LandName:   land.LandName,
				LandTag:    land.LandTag,
				Area:       land.Area,
				ImageUrls:  land.ImageURLs,
				Price:      land.Price,
				Detail:     sql.NullString{land.Detail, land.Detail != ""},
				SaleStatus: int64(land.SaleStatus),
				SaleTime:   time.Now(),
			})
		}

		return &types.AddProductResponse{
			Code: 200,
			Msg:  "新增成功",
		}, nil

	default:
		return &types.AddProductResponse{
			Code: 400,
			Msg:  "该编号不存在",
		}, err
	}

}
