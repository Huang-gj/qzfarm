package logic

import (
	"context"

	"Server_gozero/CS/commodityServer/good/rpc/good"
	"Server_gozero/CS/commodityServer/good/rpc/internal/svc"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateRepLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewUpdateRepLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateRepLogic {
	return &UpdateRepLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

func (l *UpdateRepLogic) UpdateRep(in *good.UpdateRepReq) (*good.UpdateRepResp, error) {
	// todo: add your logic here and delete this line
	err := l.svcCtx.GoodModel.UpdateRepertory(l.ctx, in.GoodID, in.Repertory)
	if err != nil {
		return nil, err
	}
	return &good.UpdateRepResp{}, nil
}
