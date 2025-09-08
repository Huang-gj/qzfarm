package farm

import (
	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"
	"context"
	"encoding/json"
	"errors"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetFarmLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetFarmLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetFarmLogic {
	return &GetFarmLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetFarmLogic) GetFarm(req *types.GetFarmRequest) (resp *types.GetFarmResponse, err error) {
	// todo: add your logic here and delete this line
	one, err := l.svcCtx.FarmModel.FindOne(l.ctx, int64(req.AdminID))
	if one == nil {
		return &types.GetFarmResponse{
			Code: 10001,
			Msg:  "该管理尚未绑定农场",
			Farm: types.Farm{},
		}, nil
	}
	if err != nil {
		logx.Errorw("GetFarm failed", logx.Field("err", err))
		return nil, errors.New("内部错误")
	}
	var iamgeurls []string
	err = json.Unmarshal(one.ImageUrls, &iamgeurls)
	if err != nil {
		logx.Errorw("GetFarm Unmarshal failed", logx.Field("err", err))
		return &types.GetFarmResponse{Code: 400, Msg: "反序列化错误"}, errors.New("内部错误")
	}
	return &types.GetFarmResponse{
		Code: 200,
		Msg:  "查找成功",
		Farm: types.Farm{
			FarmID:       int(one.FarmId),
			FarmName:     one.FarmName,
			Description:  one.Description.String,
			Address:      one.Address.String,
			LogoURL:      one.LogoUrl,
			ImageURLs:    iamgeurls,
			ContactPhone: one.ContactPhone,
		},
	}, nil

}
