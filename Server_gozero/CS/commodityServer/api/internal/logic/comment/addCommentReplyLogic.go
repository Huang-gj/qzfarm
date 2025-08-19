package comment

import (
	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"
	"Server_gozero/CS/commodityServer/model/commentReplyModel"
	"Server_gozero/common/ISender/ISender"
	"context"
	"database/sql"
	"errors"

	"github.com/zeromicro/go-zero/core/logx"
)

type AddCommentReplyLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewAddCommentReplyLogic(ctx context.Context, svcCtx *svc.ServiceContext) *AddCommentReplyLogic {
	return &AddCommentReplyLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *AddCommentReplyLogic) AddCommentReply(req *types.AddCommentReplyRequest) (resp *types.AddCommentReplyResponse, err error) {
	// todo: add your logic here and delete this line

	commentReplyID, err := l.svcCtx.Ident.GetId(l.ctx, &ISender.GetIDReq{BizTag: "comment_reply"})
	if err != nil {
		logx.Errorw("CommentReplyID Get failed", logx.Field("err", err))
		return &types.AddCommentReplyResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}

	_, err = l.svcCtx.CommentReplyModel.Insert(l.ctx, &commentReplyModel.CommentReply{
		CommentId:      int64(req.CommentReply.CommentID),
		CommentReplyId: commentReplyID,
		ReplyTo:        req.CommentReply.ReplyTo,
		Text:           sql.NullString{req.CommentReply.TEXT, req.CommentReply.TEXT != ""},
		UserId:         int64(req.CommentReply.UserID),
		Avatar:         req.CommentReply.Avatar,
		Nickname:       req.CommentReply.Nickname,
	})
	if err != nil {
		logx.Errorw("CommentReply Insert failed", logx.Field("err", err))
		return &types.AddCommentReplyResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	err = l.svcCtx.CommentModel.IncrCommentReplyNum(l.ctx, int64(req.CommentReply.CommentID))
	if err != nil {
		logx.Errorw("IncrCommentReplyNum Insert failed", logx.Field("err", err))
		return &types.AddCommentReplyResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	return &types.AddCommentReplyResponse{
		Code: 200,
		Msg:  "评论回复添加成功",
	}, nil
}
