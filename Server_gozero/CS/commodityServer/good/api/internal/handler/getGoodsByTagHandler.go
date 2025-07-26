package handler

import (
	"net/http"

	"Server_gozero/CS/commodityServer/good/api/internal/logic"
	"Server_gozero/CS/commodityServer/good/api/internal/svc"
	"Server_gozero/CS/commodityServer/good/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func getGoodsByTagHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.GetGoodsByTagRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewGetGoodsByTagLogic(r.Context(), svcCtx)
		resp, err := l.GetGoodsByTag(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
