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

	// 获取上传的文件
	_, header, err := l.request.FormFile("file")
	if err != nil {
		l.Errorf("获取上传文件失败: %v", err)
		return &types.TestResponse{
			Code: 400,
			Msg:  "获取上传文件失败",
		}, nil
	}

	if req.GoodID != -1 {
		// 上传文件到服务器
		multipart, err := common.BatchUploadFromMultipart(header, "images/goods_image_url/farm"+strconv.Itoa(req.FarmID))
		if err != nil {
			l.Errorf("文件上传失败: %v", err)
			return &types.TestResponse{
				Code: 400,
				Msg:  "文件上传失败",
			}, nil
		}

		// 查找商品记录
		one, err := l.svcCtx.GoodModel.FindOne(l.ctx, int64(req.GoodID))
		if err != nil {
			l.Errorf("查找商品失败: %v", err)
			return &types.TestResponse{
				Code: 400,
				Msg:  "商品不存在",
			}, nil
		}

		// 解析现有图片URL
		var images []string
		if err = json.Unmarshal(one.ImageUrls, &images); err != nil {
			l.Errorf("解析图片URL失败: %v", err)
			// 如果解析失败，初始化为空数组
			images = []string{}
		}

		// 添加新图片URL
		images = append(images, multipart)
		marshal, err := json.Marshal(images)
		if err != nil {
			l.Errorf("序列化图片URL失败: %v", err)
			return &types.TestResponse{
				Code: 400,
				Msg:  "序列化图片URL失败",
			}, nil
		}

		// 更新数据库
		if err = l.svcCtx.GoodModel.UpdateImageURL(l.ctx, int64(req.GoodID), marshal); err != nil {
			l.Errorf("更新商品图片失败: %v", err)
			return &types.TestResponse{
				Code: 400,
				Msg:  "更新商品图片失败",
			}, nil
		}

		fmt.Println("商品图片上传成功:", multipart)

	} else if req.LandID != -1 {
		// 上传文件到服务器
		multipart, err := common.BatchUploadFromMultipart(header, "images/lands_image_url/farm"+strconv.Itoa(req.FarmID))
		if err != nil {
			l.Errorf("文件上传失败: %v", err)
			return &types.TestResponse{
				Code: 400,
				Msg:  "文件上传失败",
			}, nil
		}

		// 查找土地记录
		one, err := l.svcCtx.LandModel.FindOne(l.ctx, int64(req.LandID))
		if err != nil {
			l.Errorf("查找土地失败: %v", err)
			return &types.TestResponse{
				Code: 400,
				Msg:  "土地不存在",
			}, nil
		}

		// 解析现有图片URL
		var images []string
		if err = json.Unmarshal(one.ImageUrls, &images); err != nil {
			l.Errorf("解析图片URL失败: %v", err)
			// 如果解析失败，初始化为空数组
			images = []string{}
		}

		// 添加新图片URL
		images = append(images, multipart)
		marshal, err := json.Marshal(images)
		if err != nil {
			l.Errorf("序列化图片URL失败: %v", err)
			return &types.TestResponse{
				Code: 400,
				Msg:  "序列化图片URL失败",
			}, nil
		}

		// 更新数据库
		if err = l.svcCtx.LandModel.UpdateImageURL(l.ctx, int64(req.LandID), marshal); err != nil {
			l.Errorf("更新土地图片失败: %v", err)
			return &types.TestResponse{
				Code: 400,
				Msg:  "更新土地图片失败",
			}, nil
		}

		fmt.Println("土地图片上传成功:", multipart)

	} else {
		return &types.TestResponse{
			Code: 400,
			Msg:  "必须指定商品ID或土地ID",
		}, nil
	}

	return &types.TestResponse{
		Code: 200,
		Msg:  "成功",
	}, nil
}
