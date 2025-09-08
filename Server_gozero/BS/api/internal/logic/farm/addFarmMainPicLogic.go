package farm

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

type AddFarmMainPicLogic struct {
	logx.Logger
	ctx     context.Context
	svcCtx  *svc.ServiceContext
	request *http.Request
}

func NewAddFarmMainPicLogic(ctx context.Context, svcCtx *svc.ServiceContext, request *http.Request) *AddFarmMainPicLogic {
	return &AddFarmMainPicLogic{
		Logger:  logx.WithContext(ctx),
		ctx:     ctx,
		svcCtx:  svcCtx,
		request: request,
	}
}

func (l *AddFarmMainPicLogic) AddFarmMainPic(req *types.AddFarmMainPicRequest) (resp *types.AddFarmMainPicResponse, err error) {
	_, header, err := l.request.FormFile("file")
	if err != nil {
		logx.Errorw("AddPic failed", logx.Field("err", err))
		return &types.AddFarmMainPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	multipart, err := common.BatchUploadFromMultipart(header, "images/Farm/MainPics/farm"+strconv.Itoa(req.FarmID))
	if err != nil {
		logx.Errorw("AddPic failed", logx.Field("err", err))
		return &types.AddFarmMainPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}

	mainPic := multipart

	err = l.svcCtx.FarmModel.UpdateLogoUrl(l.ctx, int64(req.FarmID), mainPic)

	if err != nil {
		logx.Errorw("AddPic failed", logx.Field("err", err))
		return &types.AddFarmMainPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	return &types.AddFarmMainPicResponse{Code: 200, Msg: "图片增加成功"}, nil
}
