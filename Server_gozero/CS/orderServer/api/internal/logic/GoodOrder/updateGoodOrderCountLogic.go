package GoodOrder

import (
	"context"
	"errors"

	"Server_gozero/CS/orderServer/api/internal/svc"
	"Server_gozero/CS/orderServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateGoodOrderCountLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateGoodOrderCountLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateGoodOrderCountLogic {
	return &UpdateGoodOrderCountLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdateGoodOrderCountLogic) UpdateGoodOrderCount(req *types.UpdateGoodOrderCountRequest) (resp *types.UpdateGoodOrderCountResponse, err error) {
	// todo: add your logic here and delete this line

	if req.Count <= 0 {
		err = l.svcCtx.GoodOrder.DeleteSoft(l.ctx, int64(req.UserID), int64(req.GoodOrderID))
		if err != nil {
			logx.Errorw("UpdateOrderCount failed", logx.Field("err", err))
			return &types.UpdateGoodOrderCountResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
		}
		resp = &types.UpdateGoodOrderCountResponse{Code: 200, Msg: "订单数量修改成功"}
		return &types.UpdateGoodOrderCountResponse{}, nil
	}
	err = l.svcCtx.GoodOrder.UpdateOrderCount(l.ctx, int64(req.UserID), int64(req.GoodOrderID), int64(req.Count))
	if err != nil {
		logx.Errorw("UpdateOrderCount failed", logx.Field("err", err))
		return &types.UpdateGoodOrderCountResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	resp = &types.UpdateGoodOrderCountResponse{Code: 200, Msg: "订单数量修改成功"}
	return &types.UpdateGoodOrderCountResponse{}, nil
}
