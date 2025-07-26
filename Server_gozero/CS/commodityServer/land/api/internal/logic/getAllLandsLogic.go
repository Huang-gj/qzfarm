package logic

import (
	"context"
	"errors"

	"Server_gozero/CS/commodityServer/land/api/internal/svc"
	"Server_gozero/CS/commodityServer/land/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetAllLandsLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetAllLandsLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetAllLandsLogic {
	return &GetAllLandsLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetAllLandsLogic) GetAllLands(req *types.GetLandsRequest) (resp *types.GetLandsResponse, err error) {
	// todo: add your logic here and delete this line
	AllLands, err := l.svcCtx.LandModel.GetAllLand(l.ctx)
	if err != nil {
		logx.Errorw("getAllLands_FindAll failed", logx.Field("err", err))
		return &types.GetLandsResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}

	lands := make([]*types.Land, len(AllLands))
	for i, land := range AllLands {
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
			ImageUrls:  land.ImageUrls.String,
			Price:      land.Price,
			Detail:     land.Detail.String,
			SaleStatus: land.SaleStatus,
			SaleTime:   land.SaleTime.Format("2006-01-02 15:04:05"),
		}
	}
	resp = &types.GetLandsResponse{
		Code:  200,
		Msg:   "查找成功",
		Lands: lands,
	}
	return resp, nil

}
