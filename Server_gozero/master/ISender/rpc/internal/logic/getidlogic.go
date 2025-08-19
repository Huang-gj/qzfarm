package logic

import (
	"context"

	"Server_gozero/master/ISender/rpc/ISender"
	"Server_gozero/master/ISender/rpc/internal/svc"

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
	id, err := l.svcCtx.IDModel.FindOneByBizTag(l.ctx, in.BizTag)
	if err != nil {
		return nil, err
	}
	err = l.svcCtx.IDModel.Update(l.ctx, in.BizTag)
	if err != nil {
		return nil, err
	}
	return &ISender.GetIDResp{BizTag: id.BizTag, IdStart: id.CurrentId, IdEnd: id.CurrentId + id.Step}, nil
}
