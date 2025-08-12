package LandOrder

import (
	"context"
	"errors"

	"Server_gozero/CS/orderServer/api/internal/svc"
	"Server_gozero/CS/orderServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateLandOrderCountLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateLandOrderCountLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateLandOrderCountLogic {
	return &UpdateLandOrderCountLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdateLandOrderCountLogic) UpdateLandOrderCount(req *types.UpdateLandOrderCountRequest) (resp *types.UpdateLandOrderCountResponse, err error) {
	// todo: add your logic here and delete this line

	if req.Count <= 0 {
		err = l.svcCtx.LandOrder.DeleteSoft(l.ctx, int64(req.UserID), int64(req.LandOrderID))
		if err != nil {
			logx.Errorw("UpdateOrderCount failed", logx.Field("err", err))
			return &types.UpdateLandOrderCountResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
		}
		resp = &types.UpdateLandOrderCountResponse{Code: 200, Msg: "订单数量修改成功"}
		return &types.UpdateLandOrderCountResponse{}, nil
	}
	err = l.svcCtx.LandOrder.UpdateOrderCount(l.ctx, int64(req.UserID), int64(req.LandOrderID), int64(req.Count))
	if err != nil {
		logx.Errorw("UpdateOrderCount failed", logx.Field("err", err))
		return &types.UpdateLandOrderCountResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	resp = &types.UpdateLandOrderCountResponse{Code: 200, Msg: "订单数量修改成功"}
	return &types.UpdateLandOrderCountResponse{}, nil
}
