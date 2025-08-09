package SaleData

import (
	"context"
	"errors"
	"time"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetLastOneYearSaleDataLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetLastOneYearSaleDataLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetLastOneYearSaleDataLogic {
	return &GetLastOneYearSaleDataLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetLastOneYearSaleDataLogic) GetLastOneYearSaleData(req *types.GetLastOneYearSaleDataRequest) (resp *types.GetLastOneYearSaleDataResponse, err error) {
	// todo: add your logic here and delete this line
	Time := time.Now()
	dateRange, err := l.svcCtx.SaleData.FindByDateRange(l.ctx, int64(req.FarmID), Time.AddDate(-1, 0, 0), Time)

	if err != nil {
		logx.Errorw("GetLastOneYearSaleData failed", logx.Field("err", err))
		return &types.GetLastOneYearSaleDataResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	var SaleDate []*types.SaleData
	for _, i := range dateRange {
		SaleDate = append(SaleDate, &types.SaleData{
			Farm_id:        int(i.FarmId),
			StatDate:       i.StatDate.Format("2006-01-02 15:04:05"),
			GoodOrderCount: int(i.GoodSaleCount),
			LandOrderCount: int(i.LandOrderCount),
			GoodSaleCount:  i.GoodSaleCount,
			LandSaleCount:  i.LandSaleCount,
			SysUseCount:    int(i.SysUseCount),
		})
	}
	return &types.GetLastOneYearSaleDataResponse{
		Code:            200,
		Msg:             "数据获取成功",
		OneYearSaleData: SaleDate,
	}, nil
}
