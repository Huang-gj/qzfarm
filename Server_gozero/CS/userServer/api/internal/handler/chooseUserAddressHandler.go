package handler

import (
	"net/http"

	"Server_gozero/CS/userServer/api/internal/logic"
	"Server_gozero/CS/userServer/api/internal/svc"
	"Server_gozero/CS/userServer/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func ChooseUserAddressHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.ChooseUserAddressRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewChooseUserAddressLogic(r.Context(), svcCtx)
		resp, err := l.ChooseUserAddress(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
