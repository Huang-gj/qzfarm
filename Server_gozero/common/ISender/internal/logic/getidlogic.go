package logic

import (
	"Server_gozero/common/ISender/ISender"
	"Server_gozero/common/ISender/internal/svc"
	"context"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetIDLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewGetIDLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetIDLogic {
	return &GetIDLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

func (l *GetIDLogic) GetID(in *ISender.GetIDReq) (*ISender.GetIDResp, error) {
	// todo: add your logic here and delete this line

	return &ISender.GetIDResp{}, nil
}
