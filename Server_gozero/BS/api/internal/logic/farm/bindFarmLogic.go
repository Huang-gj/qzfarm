package farm

import (
	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"
	"Server_gozero/BS/model/FarmModel"
	"Server_gozero/common/ISender/ISender"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"github.com/zeromicro/go-zero/core/logx"
)

type BindFarmLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewBindFarmLogic(ctx context.Context, svcCtx *svc.ServiceContext) *BindFarmLogic {
	return &BindFarmLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *BindFarmLogic) BindFarm(req *types.BindFarmRequest) (resp *types.BindFarmResponse, err error) {
	// todo: add your logic here and delete this line
	FarmID, err := l.svcCtx.Ident.GetId(l.ctx, &ISender.GetIDReq{BizTag: "farm"})
	imageJSON, _ := json.Marshal(req.BindFarm.ImageURLs)
	_, err = l.svcCtx.FarmModel.Insert(l.ctx, &FarmModel.Farm{
		CreateTime:   time.Now(),
		DelTime:      time.Now(),
		FarmId:       FarmID,
		AdminId:      int64(req.AdminID),
		FarmName:     req.BindFarm.FarmName,
		Description:  sql.NullString{req.BindFarm.Description, req.BindFarm.Description != ""},
		Address:      sql.NullString{req.BindFarm.Address, req.BindFarm.Address != ""},
		LogoUrl:      req.BindFarm.LogoURL,
		ImageUrls:    imageJSON,
		ContactPhone: req.BindFarm.ContactPhone,
	})
	if err != nil {
		logx.Errorw("BindFarm failed", logx.Field("err", err))
		return nil, errors.New("内部错误")
	}
	return &types.BindFarmResponse{
		Code: 200,
		Msg:  "绑定农场成功",
	}, nil

}
