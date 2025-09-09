package category

import (
	"context"
	"errors"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetCategoryLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetCategoryLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetCategoryLogic {
	return &GetCategoryLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetCategoryLogic) GetCategory(req *types.GetCategoryRequest) (resp *types.GetCategoryResponse, err error) {
	// todo: add your logic here and delete this line
	cateType, err := l.svcCtx.CategoryModel.FindByCateType(l.ctx, int64(req.CategoryType))
	if err != nil {
		logx.Errorw("GetActivityDetail failed", logx.Field("err", err))
		return &types.GetCategoryResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	var cate []*types.Category
	for _, v := range cateType {
		cate = append(cate, &types.Category{
			CategoryID:   int(v.CategoryId),
			Name:         v.Name,
			CategoryType: int(v.CateType),
			Text:         v.Text.String,
			ImageUrl:     v.ImageUrl,
		})
	}
	return &types.GetCategoryResponse{
		Category: cate,
		Code:     200,
		Msg:      "获取类目成功",
	}, nil
}
