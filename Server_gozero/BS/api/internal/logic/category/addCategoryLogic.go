package category

import (
	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"
	"Server_gozero/BS/model/CategoryModel"
	"Server_gozero/common/ISender/ISender"
	"context"
	"errors"

	"github.com/zeromicro/go-zero/core/logx"
)

type AddCategoryLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewAddCategoryLogic(ctx context.Context, svcCtx *svc.ServiceContext) *AddCategoryLogic {
	return &AddCategoryLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *AddCategoryLogic) AddCategory(req *types.AddCategoryRequest) (resp *types.AddCategoryResponse, err error) {
	// todo: add your logic here and delete this line
	categoryID, err := l.svcCtx.Ident.GetId(l.ctx, &ISender.GetIDReq{BizTag: "category"})
	if err != nil {
		logx.Errorw("生成分类分布式唯一ID失败", logx.Field("err", err))
		return &types.AddCategoryResponse{Code: 400, Msg: "生成分类分布式唯一ID失败"}, errors.New("生成分类分布式唯一ID失败")
	}
	_, err = l.svcCtx.CategoryModel.Insert(l.ctx, &CategoryModel.Category{
		CategoryId: categoryID,
		Name:       req.Category.Name,
		CateType:   int64(req.Category.CategoryType),
		Text:       req.Category.Text,
	})
	if err != nil {
		logx.Errorw("插入新种类失败", logx.Field("err", err))
		return &types.AddCategoryResponse{Code: 400, Msg: "插入新种类失败"}, errors.New("插入新种类失败")
	}
	return &types.AddCategoryResponse{CategoryID: int(categoryID), Code: 200, Msg: "插入成功"}, nil
}
