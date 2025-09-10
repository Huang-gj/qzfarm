package category

import (
	"context"
	"errors"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetFarmCatLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetFarmCatLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetFarmCatLogic {
	return &GetFarmCatLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetFarmCatLogic) GetFarmCat(req *types.GetFarmCategoryRequest) (resp *types.GetFarmCategoryResponse, err error) {
	// todo: add your logic here and delete this line
	basic, err := l.svcCtx.FarmModel.FindAllFarmBasic(l.ctx)
	if err != nil {
		logx.Errorw("获取农场基础信息失败", logx.Field("err", err))
		return &types.GetFarmCategoryResponse{Code: 400, Msg: "获取农场基础信息失败"}, errors.New("获取农场基础信息失败")
	}
	var farmCat []*types.FarmCat
	for _, cat := range basic {
		farmCat = append(farmCat, &types.FarmCat{
			FarmID:   int(cat.FarmId),
			FarmName: cat.FarmName,
			LogoURL:  cat.LogoUrl,
		})
	}
	return &types.GetFarmCategoryResponse{
		FarmCat: farmCat,
		Code:    200,
		Msg:     "查询农场成功",
	}, nil
}
