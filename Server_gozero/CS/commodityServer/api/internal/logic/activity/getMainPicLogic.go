package activity

import (
	"context"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetMainPicLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetMainPicLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetMainPicLogic {
	return &GetMainPicLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetMainPicLogic) GetMainPic(req *types.GetMainPicRequest) (resp *types.GetMainPicResponse, err error) {
	// todo: add your logic here and delete this line

	return
}
