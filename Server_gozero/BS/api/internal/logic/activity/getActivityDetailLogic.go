package activity

import (
	"context"
	"encoding/json"
	"errors"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetActivityDetailLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetActivityDetailLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetActivityDetailLogic {
	return &GetActivityDetailLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetActivityDetailLogic) GetActivityDetail(req *types.GetActivityDetailRequest) (resp *types.GetActivityDetailResponse, err error) {
	// todo: add your logic here and delete this line
	detail, err := l.svcCtx.ActivityModel.GetDetail(l.ctx, int64(req.ActivityID))
	if err != nil {
		logx.Errorw("GetActivityDetail failed", logx.Field("err", err))
		return &types.GetActivityDetailResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	var iamgeurls []string
	err = json.Unmarshal(detail.ImageUrls, &iamgeurls)
	if err != nil {
		logx.Errorw("GetActivityDetail Unmarshal failed", logx.Field("err", err))
		return &types.GetActivityDetailResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	return &types.GetActivityDetailResponse{Code: 200, Msg: "查看成功", Activities: types.Activity{
		Title:      detail.Title,
		ActivityID: int(detail.ActivityId),
		FarmID:     int(detail.FarmId),
		MainPic:    detail.MainPic,
		ImageURLs:  iamgeurls,
		Text:       detail.Text,
		StartTime:  detail.StartTime.Format("2006-01-02 15:04:05"),
		EndTime:    detail.EndTime.Format("2006-01-02 15:04:05"),
	}}, nil
}
