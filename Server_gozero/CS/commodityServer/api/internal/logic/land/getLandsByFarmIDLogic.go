package land

import (
	"context"
	"encoding/json"
	"errors"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetLandsByFarmIDLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetLandsByFarmIDLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetLandsByFarmIDLogic {
	return &GetLandsByFarmIDLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetLandsByFarmIDLogic) GetLandsByFarmID(req *types.GetLandsByFarmIDRequest) (resp *types.GetLandsByFarmIDResponse, err error) {
	AllLands, err := l.svcCtx.LandModel.FindAllByFarmID(l.ctx, int64(req.FarmID))
	if err != nil {
		logx.Errorw("getAllLands_FindAll failed", logx.Field("err", err))
		return &types.GetLandsByFarmIDResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}

	lands := make([]*types.Land, len(AllLands))
	for i, land := range AllLands {
		var images []string
		err = json.Unmarshal(land.ImageUrls, &images)
		lands[i] = &types.Land{
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
		}
	}
	resp = &types.GetLandsByFarmIDResponse{
		Code:  200,
		Msg:   "查找成功",
		Lands: lands,
	}
	return resp, nil
}
