package farm

import (
	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"
	"Server_gozero/BS/model/FarmModel"
	"context"
	"database/sql"
	"errors"
	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateFarmInfoLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateFarmInfoLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateFarmInfoLogic {
	return &UpdateFarmInfoLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdateFarmInfoLogic) UpdateFarmInfo(req *types.UpdateFarmInfoRequest) (resp *types.UpdateFarmInfoResponse, err error) {
	// todo: add your logic here and delete this line
	if req.Del == 1 {
		err = l.svcCtx.FarmModel.Delete(l.ctx, int64(req.Farm.FarmID))
		if err != nil {
			logx.Errorw("DelFarm failed", logx.Field("err", err))
			return nil, errors.New("内部错误")
		}
		return &types.UpdateFarmInfoResponse{
			Code: 200,
			Msg:  "信息修改成功",
		}, nil
	}
	if req.Status != -1 {
		err = l.svcCtx.FarmModel.UpdateStatus(l.ctx, int64(req.Farm.FarmID), int64(req.Status))
		if err != nil {
			logx.Errorw("UpdateStatus failed", logx.Field("err", err))
			return nil, errors.New("内部错误")
		}
		return &types.UpdateFarmInfoResponse{
			Code: 200,
			Msg:  "信息修改成功",
		}, nil
	}
	Farm := FarmModel.Farm{

		FarmName:     req.Farm.FarmName,
		Description:  sql.NullString{req.Farm.Description, req.Farm.Description != ""},
		Address:      sql.NullString{req.Farm.Address, req.Farm.Address != ""},
		LogoUrl:      req.Farm.LogoURL,
		ImageUrls:    req.Farm.ImageURLs,
		ContactPhone: req.Farm.ContactPhone,
	}

	err = l.svcCtx.FarmModel.UpdateByFarmId(l.ctx, int64(req.Farm.FarmID), &Farm)
	if err != nil {
		logx.Errorw("UpdateByFarmID failed", logx.Field("err", err))
		return nil, errors.New("内部错误")
	}
	return &types.UpdateFarmInfoResponse{
		Code: 200,
		Msg:  "信息修改成功",
	}, nil
}
