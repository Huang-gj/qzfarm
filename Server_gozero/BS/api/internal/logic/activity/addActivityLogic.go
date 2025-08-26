package activity

import (
	"Server_gozero/CS/commodityServer/model/activityModel"
	"Server_gozero/common/ISender/ISender"
	"context"
	"errors"
	"time"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type AddActivityLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewAddActivityLogic(ctx context.Context, svcCtx *svc.ServiceContext) *AddActivityLogic {
	return &AddActivityLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *AddActivityLogic) AddActivity(req *types.AddActivityRequest) (resp *types.AddActivityResponse, err error) {
	// todo: add your logic here and delete this line
	// todo: add your logic here and delete this line
	activity_id, err := l.svcCtx.Ident.GetId(l.ctx, &ISender.GetIDReq{BizTag: "activity"})
	if err != nil {
		logx.Errorw("Get activityID failed", logx.Field("err", err))
		return &types.AddActivityResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	start_time, _ := time.Parse("2006-01-02 15:04:05", req.Activity.StartTime)
	end_time, _ := time.Parse("2006-01-02 15:04:05", req.Activity.EndTime)

	_, err = l.svcCtx.ActivityModel.Insert(l.ctx, &activityModel.Activity{
		Title:      req.Activity.Title,
		DelState:   0,
		ActivityId: activity_id,
		DelTime:    time.Now(),
		FarmId:     int64(req.Activity.FarmID),

		Text:      req.Activity.Text,
		StartTime: start_time,
		EndTime:   end_time,
	})
	if err != nil {
		logx.Errorw("AddActivity failed", logx.Field("err", err))
		return &types.AddActivityResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	return &types.AddActivityResponse{ActivityID: int(activity_id), Code: 200, Msg: "新增成功"}, nil

}
