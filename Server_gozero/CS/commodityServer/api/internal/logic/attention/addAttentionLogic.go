package attention

import (
	"context"
	"errors"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type AddAttentionLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewAddAttentionLogic(ctx context.Context, svcCtx *svc.ServiceContext) *AddAttentionLogic {
	return &AddAttentionLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *AddAttentionLogic) AddAttention(req *types.AddAttentionRequest) (resp *types.AddAttentionResponse, err error) {
	// todo: add your logic here and delete this line
	_, err = l.svcCtx.AttentionModel.InsertByUserAndFarm(l.ctx, int64(req.UserID), int64(req.FarmID))
	if err != nil {
		logx.Errorw("新增关注失败", logx.Field("err", err))
		return &types.AddAttentionResponse{Code: 400, Msg: "新增关注失败"}, errors.New("新增关注失败")
	}
	return &types.AddAttentionResponse{
		Code: 200,
		Msg:  "新增关注成功",
	}, nil
}
