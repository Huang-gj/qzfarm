package farm

import (
	"context"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type BindFarmLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewBindFarmLogic(ctx context.Context, svcCtx *svc.ServiceContext) *BindFarmLogic {
	return &BindFarmLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *BindFarmLogic) BindFarm(req *types.BindFarmRequest) (resp *types.BindFarmResponse, err error) {
	// todo: add your logic here and delete this line

	return
}
