package good

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/zeromicro/go-zero/core/stores/sqlx"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetGoodLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetGoodLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetGoodLogic {
	return &GetGoodLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetGoodLogic) GetGood(req *types.GetGoodRequest) (resp *types.GetGoodResponse, err error) {
	// todo: add your logic here and delete this line

	good, err := l.svcCtx.GoodModel.FindOne(l.ctx, int64(req.GoodID))
	if err != nil && !errors.Is(err, sqlx.ErrNotFound) {
		logx.Errorw("getGood_FindOne failed", logx.Field("err", err))
		return &types.GetGoodResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	if err != nil {
		return &types.GetGoodResponse{Code: 400, Msg: "商品不存在"}, errors.New("商品不存在")
	}
	var images []string
	err = json.Unmarshal(good.ImageUrls, &images)
	resp = &types.GetGoodResponse{
		Code: 200,
		Msg:  "查找成功",
		Good: types.Good{
			Id:         good.Id,
			DelState:   good.DelState,
			DelTime:    good.DelTime.Format("2006-01-02 15:04:05"),
			CreateTime: good.CreateTime.Format("2006-01-02 15:04:05"),
			GoodId:     good.GoodId,
			Title:      good.Title,
			GoodTag:    good.GoodTag,
			FarmId:     good.FarmId,
			ImageUrls:  images,
			Price:      good.Price,
			Units:      good.Units,
			Repertory:  float64(good.Repertory),
			Detail:     good.Detail.String,
		},
	}
	return resp, nil
}
