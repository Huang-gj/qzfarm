package product

import (
	"Server_gozero/common"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type TestLogic struct {
	logx.Logger
	ctx     context.Context
	svcCtx  *svc.ServiceContext
	request *http.Request
}

func NewTestLogic(ctx context.Context, svcCtx *svc.ServiceContext, request *http.Request) *TestLogic {
	return &TestLogic{
		Logger:  logx.WithContext(ctx),
		ctx:     ctx,
		svcCtx:  svcCtx,
		request: request,
	}
}

func (l *TestLogic) Test(req *types.TestRequest) (resp *types.TestResponse, err error) {

	_, header, err := l.request.FormFile("file")
	if req.GoodID != -1 {
		multipart, err := common.BatchUploadFromMultipart(header, "images/goods_image_url/farm"+strconv.Itoa(req.FarmID))
		one, err := l.svcCtx.GoodModel.FindOne(l.ctx, int64(req.GoodID))
		var images []string
		err = json.Unmarshal(one.ImageUrls, &images)
		images = append(images, multipart)
		marshal, err := json.Marshal(images)
		err = l.svcCtx.GoodModel.UpdateImageURL(l.ctx, int64(req.GoodID), marshal)

		if err != nil {
			return &types.TestResponse{
				Code: 400,
				Msg:  "失败",
			}, err
		}
		fmt.Println(multipart)

	} else if req.LandID != -1 {
		multipart, err := common.BatchUploadFromMultipart(header, "images/lands_image_url/farm"+strconv.Itoa(req.FarmID))
		one, err := l.svcCtx.LandModel.FindOne(l.ctx, int64(req.LandID))
		var images []string
		err = json.Unmarshal(one.ImageUrls, &images)
		images = append(images, multipart)
		marshal, err := json.Marshal(images)
		err = l.svcCtx.LandModel.UpdateImageURL(l.ctx, int64(req.LandID), marshal)
		if err != nil {
			return &types.TestResponse{
				Code: 400,
				Msg:  "失败",
			}, err
		}
		fmt.Println(multipart)

	}
	return &types.TestResponse{
		Code: 200,
		Msg:  "成功",
	}, nil
}
