package SaleData

import (
	"context"
	"errors"
	"fmt"
	"time"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type SaleSummaryLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewSaleSummaryLogic(ctx context.Context, svcCtx *svc.ServiceContext) *SaleSummaryLogic {
	return &SaleSummaryLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *SaleSummaryLogic) SaleSummary(req *types.SaleSummaryRequest) (resp *types.SaleSummaryResponse, err error) {
	// todo: add your logic here and delete this line
	layout := "2006-01-02"
	ts, err := time.Parse(layout, req.StartDate)
	if err != nil {
		fmt.Println("解析开始日期错误:", err)
	}

	te, err := time.Parse(layout, req.EndDate)
	if err != nil {
		fmt.Println("解析结束日期错误:", err)
	}

	dateRange, err := l.svcCtx.SaleData.FindByDateRange(l.ctx, int64(req.FarmID), ts, te)
	if err != nil {
		logx.Errorw("SaleSummary failed", logx.Field("err", err))
		return &types.SaleSummaryResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	var TotalData []*types.SaleData
	for _, v := range dateRange {
		one := types.SaleData{
			Farm_id:        int(v.FarmId),
			StatDate:       v.StatDate.Format(layout),
			GoodOrderCount: int(v.GoodOrderCount),
			LandOrderCount: int(v.LandSaleCount),
			GoodSaleCount:  v.GoodSaleCount,
			LandSaleCount:  v.LandSaleCount,
			SysUseCount:    int(v.SysUseCount),
		}
		TotalData = append(TotalData, &one)

	}
	return &types.SaleSummaryResponse{
		Code:     200,
		Msg:      "查询成功",
		SaleData: TotalData,
	}, nil
}
