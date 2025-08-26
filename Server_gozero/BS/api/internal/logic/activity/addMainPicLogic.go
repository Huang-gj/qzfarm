package activity

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

type AddMainPicLogic struct {
	logx.Logger
	ctx     context.Context
	svcCtx  *svc.ServiceContext
	request *http.Request
}

func NewAddMainPicLogic(ctx context.Context, svcCtx *svc.ServiceContext, request *http.Request) *AddMainPicLogic {
	return &AddMainPicLogic{
		Logger:  logx.WithContext(ctx),
		ctx:     ctx,
		svcCtx:  svcCtx,
		request: request,
	}
}

func (l *AddMainPicLogic) AddMainPic(req *types.AddMainPicRequest) (resp *types.AddMainPicResponse, err error) {
	// todo: add your logic here and delete this line
	_, header, err := l.request.FormFile("file")
	if err != nil {
		logx.Errorw("AddPic failed", logx.Field("err", err))
		return &types.AddMainPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	multipart, err := common.BatchUploadFromMultipart(header, "images/Active/MainPics/farm"+strconv.Itoa(req.FarmID))
	if err != nil {
		logx.Errorw("AddPic failed", logx.Field("err", err))
		return &types.AddMainPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}

	mainPic := multipart

	err = l.svcCtx.ActivityModel.UpdateMainPic(l.ctx, int64(req.ActivityID), mainPic)

	if err != nil {
		logx.Errorw("AddPic failed", logx.Field("err", err))
		return &types.AddMainPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	return &types.AddMainPicResponse{Code: 200, Msg: "图片增加成功"}, nil

}
