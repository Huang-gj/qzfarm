package userCenter

import (
	"Server_gozero/common"
	"context"
	"errors"
	"net/http"
	"strconv"

	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateAvatarLogic struct {
	logx.Logger
	ctx     context.Context
	svcCtx  *svc.ServiceContext
	request *http.Request
}

func NewUpdateAvatarLogic(ctx context.Context, svcCtx *svc.ServiceContext, request *http.Request) *UpdateAvatarLogic {
	return &UpdateAvatarLogic{
		Logger:  logx.WithContext(ctx),
		ctx:     ctx,
		svcCtx:  svcCtx,
		request: request,
	}
}

func (l *UpdateAvatarLogic) UpdateAvatar(req *types.UpdateAvatarRequest) (resp *types.UpdateAvatarResponse, err error) {
	// todo: add your logic here and delete this line
	_, header, err := l.request.FormFile("file")
	multipart, err := common.BatchUploadFromMultipart(header, "images/Avatar/BS/"+strconv.Itoa(req.AdminID))
	if err != nil {
		logx.Errorw("BatchUploadFromMultipart fail", logx.Field("err", err))
		return &types.UpdateAvatarResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	err = l.svcCtx.AdminModel.UpdateAvatar(l.ctx, int64(req.AdminID), multipart)

	if err != nil {
		
		logx.Errorw("UpdateAvatar fail", logx.Field("err", err))
		return &types.UpdateAvatarResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	return &types.UpdateAvatarResponse{
		Code: 200,
		Msg:  "头像修改成功",
	}, nil

}
