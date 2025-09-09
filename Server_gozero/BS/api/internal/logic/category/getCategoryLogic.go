package category

import (
	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"
	"context"
	"errors"

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
		logx.Errorw("获取分类失败", logx.Field("err", err))
		return &types.GetCategoryResponse{Code: 400, Msg: "获取分类失败"}, errors.New("获取分类失败")
	}
	var Category []*types.Category
	for _, v := range cateType {
		Category = append(Category, &types.Category{
			CategoryID:   int(v.CategoryId),
			Name:         v.Name,
			CategoryType: int(v.CateType),
			Text:         v.Text,
			ImageUrl:     v.ImageUrl,
		})
	}
	return &types.GetCategoryResponse{
		Category: Category,
		Code:     200,
		Msg:      "获取种类成功",
	}, nil
}
