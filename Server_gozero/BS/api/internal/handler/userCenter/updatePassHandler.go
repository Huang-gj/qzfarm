package userCenter

import (
	"net/http"

	"Server_gozero/BS/api/internal/logic/userCenter"
	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func UpdatePassHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.UpdatePassRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := userCenter.NewUpdatePassLogic(r.Context(), svcCtx)
		resp, err := l.UpdatePass(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
