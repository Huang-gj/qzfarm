package logic

import (
	"context"

	"Server_gozero/CS/commodityServer/good/rpc/good"
	"Server_gozero/CS/commodityServer/good/rpc/internal/svc"

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

func (l *GetGoodLogic) GetGood(in *good.GetGoodRepReq) (*good.GetGoodRepResp, error) {
	// todo: add your logic here and delete this line
	one, err := l.svcCtx.GoodModel.FindOne(l.ctx, in.GoodID)
	if err != nil {
		return nil, err
	}
	return &good.GetGoodRepResp{Repertory: one.Repertory}, nil
}
