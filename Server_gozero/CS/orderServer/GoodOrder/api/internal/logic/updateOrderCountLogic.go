package logic

import (
	"context"
	"errors"

	"Server_gozero/CS/orderServer/GoodOrder/api/internal/svc"
	"Server_gozero/CS/orderServer/GoodOrder/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateOrderCountLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateOrderCountLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateOrderCountLogic {
	return &UpdateOrderCountLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdateOrderCountLogic) UpdateOrderCount(req *types.UpdateOrderCountRequest) (resp *types.UpdateOrderCountResponse, err error) {
	// todo: add your logic here and delete this line
	if req.Count <= 0 {
		err = l.svcCtx.GoodOrder.DeleteSoft(l.ctx, int64(req.UserID), int64(req.GoodOrderID))
		if err != nil {
			logx.Errorw("UpdateOrderCount failed", logx.Field("err", err))
			return &types.UpdateOrderCountResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
		}
		resp = &types.UpdateOrderCountResponse{Code: 200, Msg: "订单数量修改成功"}
		return &types.UpdateOrderCountResponse{}, nil
	}
	err = l.svcCtx.GoodOrder.UpdateOrderCount(l.ctx, int64(req.UserID), int64(req.GoodOrderID), int64(req.Count))
	if err != nil {
		logx.Errorw("UpdateOrderCount failed", logx.Field("err", err))
		return &types.UpdateOrderCountResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	resp = &types.UpdateOrderCountResponse{Code: 200, Msg: "订单数量修改成功"}
	return &types.UpdateOrderCountResponse{}, nil

}
