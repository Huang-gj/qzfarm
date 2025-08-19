package land

import (
	"context"
	"encoding/json"
	"errors"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetLandsByTagLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetLandsByTagLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetLandsByTagLogic {
	return &GetLandsByTagLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetLandsByTagLogic) GetLandsByTag(req *types.GetLandsByTagRequest) (resp *types.GetLandsByTagResponse, err error) {
	// todo: add your logic here and delete this line
	TagLands, err := l.svcCtx.LandModel.GetLandByTag(l.ctx, req.LandTag)
	if err != nil {
		logx.Errorw("getAllGoods_FindAll failed", logx.Field("err", err))
		return &types.GetLandsByTagResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}

	lands := make([]*types.Land, len(TagLands))
	for i, land := range TagLands {
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
	resp = &types.GetLandsByTagResponse{
		Code:  200,
		Msg:   "查找成功",
		Lands: lands,
	}
	return resp, nil
}
