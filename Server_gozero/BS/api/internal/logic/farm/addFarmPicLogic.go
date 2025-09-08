package farm

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

type AddFarmPicLogic struct {
	logx.Logger
	ctx     context.Context
	svcCtx  *svc.ServiceContext
	request *http.Request
}

func NewAddFarmPicLogic(ctx context.Context, svcCtx *svc.ServiceContext, request *http.Request) *AddFarmPicLogic {
	return &AddFarmPicLogic{
		Logger:  logx.WithContext(ctx),
		ctx:     ctx,
		svcCtx:  svcCtx,
		request: request,
	}
}

func (l *AddFarmPicLogic) AddFarmPic(req *types.AddFarmPicRequest) (resp *types.AddFarmPicResponse, err error) {
	_, header, err := l.request.FormFile("file")
	if err != nil {
		logx.Errorw("AddPic failed", logx.Field("err", err))
		return &types.AddFarmPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	multipart, err := common.BatchUploadFromMultipart(header, "images/Farm/Pics/farm"+strconv.Itoa(req.FarmID))
	if err != nil {
		logx.Errorw("AddPic failed", logx.Field("err", err))
		return &types.AddFarmPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	one, err := l.svcCtx.FarmModel.FindOneByFarmID(l.ctx, int64(req.FarmID))
	if err != nil {
		logx.Errorw("AddPic failed", logx.Field("err", err))
		return &types.AddFarmPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	var images []string
	if one.ImageUrls != nil {
		err = json.Unmarshal(one.ImageUrls, &images)
		if err != nil {
			logx.Errorw("AddPic failed", logx.Field("err", err))
			return &types.AddFarmPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
		}
	}

	images = append(images, multipart)
	marshal, err := json.Marshal(images)
	if err != nil {
		logx.Errorw("AddPic failed", logx.Field("err", err))
		return &types.AddFarmPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	err = l.svcCtx.FarmModel.UpdateImageUrls(l.ctx, int64(req.FarmID), marshal)

	if err != nil {
		logx.Errorw("AddPic failed", logx.Field("err", err))
		return &types.AddFarmPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	return &types.AddFarmPicResponse{Code: 200, Msg: "图片增加成功"}, nil
}
