package SaleData

import (
	"context"
	"errors"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetTotalDataLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetTotalDataLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetTotalDataLogic {
	return &GetTotalDataLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetTotalDataLogic) GetTotalData(req *types.GetTotalDataRequest) (resp *types.GetTotalDataResponse, err error) {
	// todo: add your logic here and delete this line
	all, err := l.svcCtx.SaleData.FindAll(l.ctx, int64(req.FarmID))
	if err != nil {
		logx.Errorw("GetTotalData failed", logx.Field("err", err))
		return &types.GetTotalDataResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	TotalData := types.SaleData{}
	for _, v := range all {
		TotalData.GoodSaleCount += v.GoodSaleCount
		TotalData.LandSaleCount += v.LandSaleCount
		TotalData.LandOrderCount += int(v.LandOrderCount)
		TotalData.GoodOrderCount += int(v.GoodOrderCount)
		TotalData.SysUseCount += int(v.SysUseCount)
	}
	return &types.GetTotalDataResponse{
		Code:           200,
		Msg:            "获取数据成功",
		GoodOrderCount: TotalData.GoodOrderCount,
		LandOrderCount: TotalData.LandOrderCount,
		GoodSaleCount:  TotalData.GoodSaleCount,
		LandSaleCount:  TotalData.LandSaleCount,
		SysUseCount:    TotalData.SysUseCount,
	}, nil
}
