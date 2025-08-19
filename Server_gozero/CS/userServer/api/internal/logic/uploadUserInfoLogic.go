package logic

import (
	"Server_gozero/CS/userServer/model/userModel"
	"api/internal/svc"
	"api/internal/types"
	"context"
	"errors"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"

	"github.com/zeromicro/go-zero/core/logx"
)

type UploadUserInfoLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUploadUserInfoLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UploadUserInfoLogic {
	return &UploadUserInfoLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UploadUserInfoLogic) UploadUserInfo(req *types.UpdateUserInfoRequest) (resp *types.UpdateUserInfoResponse, err error) {
	// 添加调试日志

	user := &userModel.User{
		UserId:      int64(req.Userinfo.UserID),
		PhoneNumber: req.Userinfo.PhoneNumber,
		Avatar:      req.Userinfo.Avatar,
		Nickname:    req.Userinfo.NickName,
		Address:     req.Userinfo.Address,
		Gender:      int64(req.Userinfo.Gender),
		DelTime:     time.Now(),
	}

	err = l.svcCtx.UserModel.UpdateUserInfo(l.ctx, user)
	if err != nil && !errors.Is(err, sqlx.ErrNotFound) {
		logx.Errorw("user_upload_user_info failed", logx.Field("err", err))
		return &types.UpdateUserInfoResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}

	return &types.UpdateUserInfoResponse{Code: 200, Msg: "信息修改成功"}, nil
}
