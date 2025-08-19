package product

import (
	"context"
	"errors"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type DelProductLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewDelProductLogic(ctx context.Context, svcCtx *svc.ServiceContext) *DelProductLogic {
	return &DelProductLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *DelProductLogic) DelProduct(req *types.DelProductRequest) (resp *types.DelProductResponse, err error) {
	// todo: add your logic here and delete this line
	switch req.ProductType {
	case 1:
		err = l.svcCtx.GoodModel.Delete(l.ctx, int64(req.FarmID), int64(req.GoodID))
		if err != nil {
			logx.Errorw("DelProduct failed", logx.Field("err", err))
			return &types.DelProductResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
		}
		return &types.DelProductResponse{
			Code: 200,
			Msg:  "删除成功",
		}, nil
	case 2:
		err = l.svcCtx.LandModel.Delete(l.ctx, int64(req.FarmID), int64(req.LandID))
		if err != nil {
			logx.Errorw("DelProduct failed", logx.Field("err", err))
			return &types.DelProductResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
		}
		return &types.DelProductResponse{
			Code: 200,
			Msg:  "删除成功",
		}, nil
	default:
		return &types.DelProductResponse{
			Code: 400,
			Msg:  "该编号不存在",
		}, err
	}

}
