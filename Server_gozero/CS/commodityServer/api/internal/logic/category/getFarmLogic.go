package category

import (
	"context"
	"encoding/json"
	"errors"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

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

	one, err := l.svcCtx.FarmModel.FindOne(l.ctx, int64(req.FarmID))
	if err != nil {
		logx.Errorw("查询农场详情失败", logx.Field("err", err))
		return &types.GetFarmResponse{Code: 400, Msg: "查询农场详情失败"}, errors.New("查询农场详情失败")
	}
	var iamgeurls []string
	err = json.Unmarshal(one.ImageUrls, &iamgeurls)
	if err != nil {
		logx.Errorw("反序列化错误", logx.Field("err", err))
		return &types.GetFarmResponse{Code: 400, Msg: "反序列化错误"}, errors.New("反序列化错误")
	}
	return &types.GetFarmResponse{
		Farm: types.Farm{
			FarmID:       int(one.FarmId),
			FarmName:     one.FarmName,
			Description:  one.Description,
			Address:      one.Address,
			LogoURL:      one.LogoUrl,
			ImageURLs:    iamgeurls,
			ContactPhone: one.ContactPhone,
			Status:       int(one.Status),
		},
		Code: 200,
		Msg:  "查询成功",
	}, nil

}
