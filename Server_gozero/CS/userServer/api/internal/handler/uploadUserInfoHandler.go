package handler

import (
	"api/internal/logic"
	"api/internal/svc"
	"api/internal/types"
	"net/http"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func UploadUserInfoHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.UpdateUserInfoRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewUploadUserInfoLogic(r.Context(), svcCtx)
		resp, err := l.UploadUserInfo(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
