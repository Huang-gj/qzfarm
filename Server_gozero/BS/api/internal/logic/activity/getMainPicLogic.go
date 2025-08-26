package activity

import (
	"context"
	"errors"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetMainPicLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetMainPicLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetMainPicLogic {
	return &GetMainPicLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetMainPicLogic) GetMainPic(req *types.GetMainPicRequest) (resp *types.GetMainPicResponse, err error) {
	// todo: add your logic here and delete this line
	ids, titles, pics, err := l.svcCtx.ActivityModel.GetTitleAndMainPicByFarmID(l.ctx, int64(req.FarmID))
	if err != nil {
		logx.Errorw("AddPic failed", logx.Field("err", err))
		return &types.GetMainPicResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	return &types.GetMainPicResponse{Code: 200, Msg: "获取成功", MainPics: pics, Title: titles, ActivityIDs: ids}, nil
}
