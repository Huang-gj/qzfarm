package logic

import (
	"Server_gozero/BS/rpc/BSRPC"
	"Server_gozero/CS/userServer/model/userModel"
	"Server_gozero/common/ISender/ISender"

	"context"
	"crypto/md5"
	"time"

	"api/internal/svc"
	"api/internal/types"
	"encoding/hex"
	"errors"
	"github.com/zeromicro/go-zero/core/stores/sqlx"

	"github.com/zeromicro/go-zero/core/logx"
)

var secret = []byte("江城路")

type RegisterLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewRegisterLogic(ctx context.Context, svcCtx *svc.ServiceContext) *RegisterLogic {
	return &RegisterLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *RegisterLogic) Register(req *types.RegisterRequest) (resp *types.RegisterResponse, err error) {
	u, err := l.svcCtx.UserModel.FindOneByPhoneNumber(l.ctx, req.PhoneNumber)
	if err != nil && !errors.Is(err, sqlx.ErrNotFound) {
		logx.Errorw("user_register_UserModel.FindOneByUsername failed", logx.Field("err", err))
		return &types.RegisterResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}
	if u != nil {
		return &types.RegisterResponse{Code: 400, Msg: "用户名已存在"}, errors.New("用户名已存在")
	}

	h := md5.New()
	h.Write([]byte(req.Password))
	h.Write(secret)
	passwordStr := hex.EncodeToString(h.Sum(nil))
	userid, err := l.svcCtx.Ident.GetId(l.ctx, &ISender.GetIDReq{BizTag: "user"})
	if err != nil {
		logx.Errorw("分布式唯一id获取错误！", logx.Field("err", err))
		return &types.RegisterResponse{Code: 400, Msg: "内部错误"}, errors.New("内部错误")
	}

	user := &userModel.User{
		UserId:      userid,
		PhoneNumber: req.PhoneNumber,
		Password:    passwordStr,
		Nickname:    req.Nickname,
		DelTime:     time.Now(),
		CreateTime:  time.Now(),
	}

	if _, err := l.svcCtx.UserModel.Insert(context.Background(), user); err != nil {
		logx.Errorf("user_signup_UserModel.Insert failed, err:%v", err)
		return &types.RegisterResponse{Code: 400, Msg: "信息插入失败"}, err
	}
	Resp, err := l.svcCtx.BsRpc.AddUser(l.ctx, &BSRPC.AddUserReq{UserId: userid})
	if err != nil {
		logx.Errorf("user_updateUserData failed, err:%v,%v", Resp, err.Error())

	}
	return &types.RegisterResponse{Code: 200, Msg: "注册成功！"}, nil
}
