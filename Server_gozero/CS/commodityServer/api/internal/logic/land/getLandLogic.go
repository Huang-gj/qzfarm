package land

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/zeromicro/go-zero/core/stores/sqlx"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetLandLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetLandLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetLandLogic {
	return &GetLandLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetLandLogic) GetLand(req *types.GetLandRequest) (resp *types.GetLandResponse, err error) {
	// todo: add your logic here and delete this line

	land, err := l.svcCtx.LandModel.FindOne(l.ctx, int64(req.LandID))
	if err != nil && !errors.Is(err, sqlx.ErrNotFound) {
		logx.Errorw("getGood_FindOne failed", logx.Field("err", err))
		return &types.GetLandResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	if err != nil {
		return &types.GetLandResponse{Code: 400, Msg: "商品不存在"}, errors.New("商品不存在")
	}
	var images []string
	err = json.Unmarshal(land.ImageUrls, &images)
	resp = &types.GetLandResponse{
		Code: 200,
		Msg:  "查找成功",
		Land: types.Land{
			Id:         land.Id,
			DelState:   land.DelState,
			DelTime:    land.DelTime.Format("2006-01-02 15:04:05"),
			CreateTime: land.CreateTime.Format("2006-01-02 15:04:05"),
			LandId:     land.LandId,
			FarmId:     land.FarmId,
			LandName:   land.LandName,
			LandTag:    land.LandTag,
			Area:       land.Area,
			ImageUrls:  images,
			Price:      land.Price,
			Detail:     land.Detail.String,
			SaleStatus: land.SaleStatus,
			SaleTime:   land.SaleTime.Format("2006-01-02 15:04:05"),
		},
	}
	return resp, nil
}
