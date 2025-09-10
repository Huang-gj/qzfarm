package category

import (
	"context"
	"errors"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetFarmAttentionLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetFarmAttentionLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetFarmAttentionLogic {
	return &GetFarmAttentionLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetFarmAttentionLogic) GetFarmAttention(req *types.GetFarmAttentionRequest) (resp *types.GetFarmAttentionResponse, err error) {
	// todo: add your logic here and delete this line
	user, err := l.svcCtx.AttentionModel.FindFarmIdsByUser(l.ctx, int64(req.UserID))
	if err != nil {
		logx.Errorw("获取用户关注信息失败", logx.Field("err", err))
		return &types.GetFarmAttentionResponse{Code: 400, Msg: "获取用户关注信息失败"}, errors.New("获取用户关注信息失败")
	}
	var farmCat []*types.FarmCat
	for _, v := range user {
		one, err := l.svcCtx.FarmModel.FindOne(l.ctx, v)
		if err != nil {
			logx.Errorw("获取用户关注信息失败", logx.Field("err", err))
			return &types.GetFarmAttentionResponse{Code: 400, Msg: "获取用户关注信息失败"}, errors.New("获取用户关注信息失败")
		}
		farmCat = append(farmCat, &types.FarmCat{
			FarmID:   int(one.FarmId),
			FarmName: one.FarmName,
			LogoURL:  one.LogoUrl,
		})

	}

	return &types.GetFarmAttentionResponse{
		FarmCat: farmCat,
		Code:    200,
		Msg:     "查询关注信息成功",
	}, nil
}
