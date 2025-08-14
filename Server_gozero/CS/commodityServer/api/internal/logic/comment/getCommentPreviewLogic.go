package comment

import (
	"context"
	"errors"

	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetCommentPreviewLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetCommentPreviewLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetCommentPreviewLogic {
	return &GetCommentPreviewLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetCommentPreviewLogic) GetCommentPreview(req *types.GetCommentRequest) (resp *types.GetCommentResponse, err error) {
	// todo: add your logic here and delete this line
	var Comments []*types.Comment
	if req.LandID > 0 {
		comments, err := l.svcCtx.CommentModel.FindTwoByLandID(l.ctx, int64(req.LandID))
		if err != nil {
			logx.Errorw("FindAllByLandID Fail ", logx.Field("err", err))
			return &types.GetCommentResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
		}

		for _, comment := range comments {
			_, num, err := l.svcCtx.CommentReplyModel.FindAllByCommentID(l.ctx, comment.CommentId)
			if err != nil {
				logx.Errorw("FindAllByCommentID Fail ", logx.Field("err", err))
				return &types.GetCommentResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
			}
			Comments = append(Comments, &types.Comment{
				ID:              int(comment.Id),
				CreateTime:      comment.CreateTime.Format("2006-01-02 15:04:05"),
				TEXT:            comment.Text.String,
				CommentID:       int(comment.CommentId),
				GoodID:          int(comment.GoodId),
				LandID:          int(comment.LandId),
				UserID:          int(comment.UserId),
				Avatar:          comment.Avatar,
				Nickname:        comment.Nickname,
				CommentReplyNum: int(num),
			})
		}
	} else if req.GoodID > 0 {
		comments, err := l.svcCtx.CommentModel.FindTwoByGoodID(l.ctx, int64(req.GoodID))
		if err != nil {
			logx.Errorw("FindAllByGoodID Fail ", logx.Field("err", err))
			return &types.GetCommentResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
		}

		for _, comment := range comments {
			_, num, err := l.svcCtx.CommentReplyModel.FindAllByCommentID(l.ctx, comment.CommentId)
			if err != nil {
				logx.Errorw("FindAllByCommentID Fail ", logx.Field("err", err))
				return &types.GetCommentResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
			}
			Comments = append(Comments, &types.Comment{
				ID:              int(comment.Id),
				CreateTime:      comment.CreateTime.Format("2006-01-02 15:04:05"),
				TEXT:            comment.Text.String,
				CommentID:       int(comment.CommentId),
				GoodID:          int(comment.GoodId),
				LandID:          int(comment.LandId),
				UserID:          int(comment.UserId),
				Avatar:          comment.Avatar,
				Nickname:        comment.Nickname,
				CommentReplyNum: int(num),
			})
		}
	} else {

		logx.Errorw("Comment Can not find LandID or GoodID ", logx.Field("err", err))
		return &types.GetCommentResponse{Code: 400, Msg: "传参错误"}, errors.New("传参错误")

	}

	return &types.GetCommentResponse{
		Code:     200,
		Msg:      "获取评论成功",
		Comments: Comments,
	}, nil
}
