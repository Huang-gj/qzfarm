package farm

import (
	"context"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetFarmLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetFarmLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetFarmLogic {
	return &GetFarmLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetFarmLogic) GetFarm(req *types.GetFarmRequest) (resp *types.GetFarmResponse, err error) {
	// todo: add your logic here and delete this line

	return
}
