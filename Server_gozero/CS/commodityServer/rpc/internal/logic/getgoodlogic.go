package logic

import (
	"context"

	"Server_gozero/CS/commodityServer/rpc/commodity"
	"Server_gozero/CS/commodityServer/rpc/internal/svc"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetGoodLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewGetGoodLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetGoodLogic {
	return &GetGoodLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

func (l *GetGoodLogic) GetGood(in *commodity.GetGoodRepReq) (*commodity.GetGoodRepResp, error) {
	// todo: add your logic here and delete this line
	one, err := l.svcCtx.GoodModel.FindOne(l.ctx, in.GoodID)
	if err != nil {
		return nil, err
	}
	return &commodity.GetGoodRepResp{Repertory: one.Repertory}, nil
}
