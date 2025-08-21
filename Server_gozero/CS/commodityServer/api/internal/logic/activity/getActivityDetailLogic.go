package activity

import (
	"context"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetActivityDetailLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetActivityDetailLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetActivityDetailLogic {
	return &GetActivityDetailLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetActivityDetailLogic) GetActivityDetail(req *types.GetActivityDetailRequest) (resp *types.GetActivityDetailResponse, err error) {
	// todo: add your logic here and delete this line

	return
}
