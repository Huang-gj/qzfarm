package attention

import (
	"context"
	"errors"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type DelAttentionLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewDelAttentionLogic(ctx context.Context, svcCtx *svc.ServiceContext) *DelAttentionLogic {
	return &DelAttentionLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *DelAttentionLogic) DelAttention(req *types.DelAttentionRequest) (resp *types.DelAttentionResponse, err error) {
	err = l.svcCtx.AttentionModel.DeleteByUserAndFarm(l.ctx, int64(req.UserID), int64(req.FarmID))
	if err != nil {
		logx.Errorw("删除关注失败", logx.Field("err", err))
		return &types.DelAttentionResponse{Code: 400, Msg: "删除关注失败"}, errors.New("删除关注失败")
	}
	return &types.DelAttentionResponse{
		Code: 200,
		Msg:  "删除关注成功",
	}, nil
}
