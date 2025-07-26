package handler

import (
	"net/http"

	"Server_gozero/CS/commodityServer/land/api/internal/logic"
	"Server_gozero/CS/commodityServer/land/api/internal/svc"
	"Server_gozero/CS/commodityServer/land/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func getLandsByTagHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.GetLandsByTagRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewGetLandsByTagLogic(r.Context(), svcCtx)
		resp, err := l.GetLandsByTag(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
