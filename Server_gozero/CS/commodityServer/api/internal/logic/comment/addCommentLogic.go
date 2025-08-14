package comment

import (
	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"
	"Server_gozero/CS/commodityServer/model/commentModel"
	"Server_gozero/common/ISender/ISender"
	"context"
	"database/sql"
	"errors"

	"github.com/zeromicro/go-zero/core/logx"
)

type AddCommentLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewAddCommentLogic(ctx context.Context, svcCtx *svc.ServiceContext) *AddCommentLogic {
	return &AddCommentLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *AddCommentLogic) AddComment(req *types.AddCommentRequest) (resp *types.AddCommentResponse, err error) {
	// todo: add your logic here and delete this line
	commentID, err := l.svcCtx.Ident.GetId(l.ctx, &ISender.GetIDReq{BizTag: "comment"})
	if err != nil {
		logx.Errorw("CommentID Get failed", logx.Field("err", err))
		return &types.AddCommentResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}

	_, err = l.svcCtx.CommentModel.Insert(l.ctx, &commentModel.Comment{
		Text:            sql.NullString{String: req.Comment.TEXT, Valid: req.Comment.TEXT != ""},
		CommentId:       commentID,
		GoodId:          int64(req.Comment.GoodID),
		LandId:          int64(req.Comment.LandID),
		UserId:          int64(req.Comment.UserID),
		Avatar:          req.Comment.Avatar,
		Nickname:        req.Comment.Nickname,
		CommentReplyNum: 0,
	})
	if err != nil {
		logx.Errorw("Comment Insert failed", logx.Field("err", err))
		return &types.AddCommentResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	return &types.AddCommentResponse{
		Code: 200,
		Msg:  "评论添加成功",
	}, nil
}
