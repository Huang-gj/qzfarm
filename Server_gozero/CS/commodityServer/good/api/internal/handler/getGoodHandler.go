package handler

import (
	"net/http"

	"Server_gozero/CS/commodityServer/good/api/internal/logic"
	"Server_gozero/CS/commodityServer/good/api/internal/svc"
	"Server_gozero/CS/commodityServer/good/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func GetGoodHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.GetGoodRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewGetGoodLogic(r.Context(), svcCtx)
		resp, err := l.GetGood(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
