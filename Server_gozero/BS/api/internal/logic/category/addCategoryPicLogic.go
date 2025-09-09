package category

import (
	"Server_gozero/common"
	"context"
	"errors"
	"net/http"
	"strconv"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type AddCategoryPicLogic struct {
	logx.Logger
	ctx     context.Context
	svcCtx  *svc.ServiceContext
	request *http.Request
}

func NewAddCategoryPicLogic(ctx context.Context, svcCtx *svc.ServiceContext, request *http.Request) *AddCategoryPicLogic {
	return &AddCategoryPicLogic{
		Logger:  logx.WithContext(ctx),
		ctx:     ctx,
		svcCtx:  svcCtx,
		request: request,
	}
}

func (l *AddCategoryPicLogic) AddCategoryPic(req *types.AddCategoryPicRequest) (resp *types.AddCategoryPicResponse, err error) {
	// todo: add your logic here and delete this line
	_, header, err := l.request.FormFile("file")
	if err != nil {
		l.Errorf("获取上传文件失败: %v", err)
		return &types.AddCategoryPicResponse{
			Code: 400,
			Msg:  "获取上传文件失败",
		}, nil
	}
	multipart, err := common.BatchUploadFromMultipart(header, "images/Category/"+strconv.Itoa(req.CategoryID))
	if err != nil {
		l.Errorf("文件上传失败: %v", err)
		return &types.AddCategoryPicResponse{
			Code: 400,
			Msg:  "文件上传失败",
		}, nil
	}
	err = l.svcCtx.CategoryModel.UpdateImageUrlByCategoryId(l.ctx, int64(req.CategoryID), multipart)
	if err != nil {
		logx.Errorw("更新类目图片链接失败", logx.Field("err", err))
		return &types.AddCategoryPicResponse{Code: 400, Msg: "更新类目图片链接失败"}, errors.New("更新类目图片链接失败")
	}
	return &types.AddCategoryPicResponse{
		Code: 200,
		Msg:  "新增类目图片成功",
	}, nil
}
