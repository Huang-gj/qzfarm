package activity

import (
	"Server_gozero/common"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type AddPicLogic struct {
	logx.Logger
	ctx     context.Context
	svcCtx  *svc.ServiceContext
	request *http.Request
}

func NewAddPicLogic(ctx context.Context, svcCtx *svc.ServiceContext, request *http.Request) *AddPicLogic {
	return &AddPicLogic{
		Logger:  logx.WithContext(ctx),
		ctx:     ctx,
		svcCtx:  svcCtx,
		request: request,
	}
}

func (l *AddPicLogic) AddPic(req *types.AddPicRequest) (resp *types.AddPicResponse, err error) {
	// todo: add your logic here and delete this line
	_, header, err := l.request.FormFile("file")
	if err != nil {
		logx.Errorw("AddPic failed", logx.Field("err", err))
		return &types.AddPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	multipart, err := common.BatchUploadFromMultipart(header, "images/Active/pics/farm"+strconv.Itoa(req.FarmID))
	if err != nil {
		logx.Errorw("AddPic failed", logx.Field("err", err))
		return &types.AddPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	one, err := l.svcCtx.ActivityModel.FindOne(l.ctx, int64(req.ActivityID))
	if err != nil {
		logx.Errorw("AddPic failed", logx.Field("err", err))
		return &types.AddPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	var images []string
	if one.ImageUrls != nil {
		err = json.Unmarshal(one.ImageUrls, &images)
		if err != nil {
			logx.Errorw("AddPic failed", logx.Field("err", err))
			return &types.AddPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
		}
	}

	images = append(images, multipart)
	marshal, err := json.Marshal(images)
	if err != nil {
		logx.Errorw("AddPic failed", logx.Field("err", err))
		return &types.AddPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	err = l.svcCtx.ActivityModel.UpdateImageURL(l.ctx, int64(req.ActivityID), marshal)

	if err != nil {
		logx.Errorw("AddPic failed", logx.Field("err", err))
		return &types.AddPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	return &types.AddPicResponse{Code: 200, Msg: "图片增加成功"}, nil

}
