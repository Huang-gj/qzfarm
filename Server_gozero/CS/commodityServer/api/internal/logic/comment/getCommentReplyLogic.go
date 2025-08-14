package comment

import (
	"context"
	"errors"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetCommentReplyLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetCommentReplyLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetCommentReplyLogic {
	return &GetCommentReplyLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetCommentReplyLogic) GetCommentReply(req *types.GetCommentReplyRequest) (resp *types.GetCommentReplyResponse, err error) {
	// todo: add your logic here and delete this line
	CommentReplys, _, err := l.svcCtx.CommentReplyModel.FindAllByCommentID(l.ctx, int64(req.CommentID))
	if err != nil {
		logx.Errorw("FindAllByCommentID Fail ", logx.Field("err", err))
		return &types.GetCommentReplyResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	var comments []*types.CommentReply
	for _, comment := range CommentReplys {
		comments = append(comments, &types.CommentReply{
			ID:             int(comment.Id),
			CreateTime:     comment.CreateTime.Format("2006-01-02 15:04:05"),
			CommentID:      int(comment.CommentId),
			CommentReplyID: int(comment.CommentReplyId),
			ReplyTo:        comment.ReplyTo,
			TEXT:           comment.Text.String,
			UserID:         int(comment.UserId),
			Avatar:         comment.Avatar,
			Nickname:       comment.Nickname,
		})
	}
	return &types.GetCommentReplyResponse{
		Code:           200,
		Msg:            "评论回复数据获取成功",
		CommentReplies: comments,
	}, nil
}
