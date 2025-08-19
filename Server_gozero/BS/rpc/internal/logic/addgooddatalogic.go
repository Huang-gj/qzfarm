package logic

import (
	"context"

	"Server_gozero/BS/rpc/BS"
	"Server_gozero/BS/rpc/internal/svc"

	"github.com/zeromicro/go-zero/core/logx"
)

type AddGoodDataLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewAddGoodDataLogic(ctx context.Context, svcCtx *svc.ServiceContext) *AddGoodDataLogic {
	return &AddGoodDataLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

func (l *AddGoodDataLogic) AddGoodData(in *BS.AddGoodDataReq) (*BS.AddGoodDataResp, error) {
	// todo: add your logic here and delete this line
	err := l.svcCtx.SaleData.AddGoodData(l.ctx, in.FarmId, in.GoodSaleCount)
	if err != nil {
		return &BS.AddGoodDataResp{Code: 400, Msg: "增加商品销售数据失败"}, err
	}
	return &BS.AddGoodDataResp{Code: 200, Msg: "增加商品销售数据成功"}, nil

}
