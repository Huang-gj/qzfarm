package logic

import (
	"Server_gozero/common"
	"api/internal/svc"
	"api/internal/types"
	"context"
	"errors"
	"net/http"
	"strconv"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateAvatarLogic struct {
	logx.Logger
	ctx     context.Context
	svcCtx  *svc.ServiceContext
	request *http.Request
}

func NewUpdateAvatarLogic(ctx context.Context, svcCtx *svc.ServiceContext, r *http.Request) *UpdateAvatarLogic {
	return &UpdateAvatarLogic{
		Logger:  logx.WithContext(ctx),
		ctx:     ctx,
		svcCtx:  svcCtx,
		request: r,
	}
}

func (l *UpdateAvatarLogic) UpdateAvatar(req *types.UpdateAvatarRequest) (resp *types.UpdateAvatarResponse, err error) {
	// todo: add your logic here and delete this line
	_, header, err := l.request.FormFile("file")
	multipart, err := common.BatchUploadFromMultipart(header, "images/Avatar/CS/"+strconv.Itoa(req.UserID))
	err = l.svcCtx.UserModel.UpdateAvatar(l.ctx, int64(req.UserID), multipart)
	if err != nil {
		logx.Errorw("UpdateAvatar fail", logx.Field("err", err))
		return &types.UpdateAvatarResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	return &types.UpdateAvatarResponse{
		Code: 200,
		Msg:  "头像修改成功",
	}, nil
}
