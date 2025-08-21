package activity

import (
	"Server_gozero/CS/commodityServer/model/activityModel"
	"context"
	"database/sql"
	"time"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

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
	l.svcCtx.ActivityModel.Insert(l.ctx, activityModel.Activity{
		Id:         0,
		DelState:   0,
		DelTime:    time.Time{},
		CreateTime: time.Time{},
		FarmId:     0,
		MainPic:    "",
		ImageUrls:  sql.NullString{},
		Text:       sql.NullString{},
		StartTime:  time.Time{},
		EndTime:    time.Time{},
	})
	return
}
