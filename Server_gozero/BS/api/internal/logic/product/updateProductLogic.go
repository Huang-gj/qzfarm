package product

import (
	"Server_gozero/BS/model/Product/Good"
	"Server_gozero/BS/model/Product/Land"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateProductLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateProductLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateProductLogic {
	return &UpdateProductLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdateProductLogic) UpdateProduct(req *types.UpdateProductRequest) (resp *types.UpdateProductResponse, err error) {
	// todo: add your logic here and delete this line
	switch req.ProductType {
	case 1:
		image, err := json.Marshal(req.Good.ImageURLs)
		err = l.svcCtx.GoodModel.Update(l.ctx, &Good.Good{

			GoodId:    int64(req.Good.GoodID),
			Title:     req.Good.GoodName,
			GoodTag:   req.Good.GoodTag,
			FarmId:    int64(req.FarmID),
			ImageUrls: image,
			Price:     req.Good.Price,
			Units:     req.Good.Units,
			Repertory: int64(req.Good.Repertory),
			Detail:    sql.NullString{req.Good.Detail, req.Good.Detail != ""},
		})
		if err != nil {
			logx.Errorw("UpdateProduct failed", logx.Field("err", err))
			return &types.UpdateProductResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
		}
		resp = &types.UpdateProductResponse{
			Code: 200,
			Msg:  "查找成功",
		}
		return resp, nil
	case 2:
		image, err := json.Marshal(req.Land.ImageURLs)
		err = l.svcCtx.LandModel.Update(l.ctx, &Land.Land{

			LandId:     int64(req.Land.LandID),
			FarmId:     int64(req.FarmID),
			LandName:   req.Land.LandName,
			LandTag:    req.Land.LandTag,
			Area:       req.Land.Area,
			ImageUrls:  image,
			Price:      req.Land.Price,
			Detail:     sql.NullString{req.Land.Detail, req.Land.Detail != ""},
			SaleStatus: int64(req.Land.SaleStatus),
			SaleTime:   time.Now(),
		})
		if err != nil {
			logx.Errorw("UpdateProduct failed", logx.Field("err", err))
			return &types.UpdateProductResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
		}
		resp = &types.UpdateProductResponse{
			Code: 200,
			Msg:  "查找成功",
		}
		return resp, nil
	default:
		return &types.UpdateProductResponse{
			Code: 400,
			Msg:  "该编号不存在",
		}, nil
	}

}
