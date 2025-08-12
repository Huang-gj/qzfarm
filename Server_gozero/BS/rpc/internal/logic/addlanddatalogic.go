package logic

import (
	"context"

	"Server_gozero/BS/rpc/BS"
	"Server_gozero/BS/rpc/internal/svc"

	"github.com/zeromicro/go-zero/core/logx"
)

type AddLandDataLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewAddLandDataLogic(ctx context.Context, svcCtx *svc.ServiceContext) *AddLandDataLogic {
	return &AddLandDataLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

func (l *AddLandDataLogic) AddLandData(in *BS.AddLandDataReq) (*BS.AddLandDataResp, error) {
	// todo: add your logic here and delete this line
	err := l.svcCtx.SaleData.AddLandData(l.ctx, in.FarmId, in.LandSaleCount)
	if err != nil {
		return &BS.AddLandDataResp{Code: 400, Msg: "增加土地销售数据失败"}, err
	}
	return &BS.AddLandDataResp{Code: 200, Msg: "增加土地销售数据成功"}, nil
}
