package category

import (
	"net/http"

	"Server_gozero/CS/commodityServer/api/internal/logic/category"
	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func GetFarmAttentionHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.GetFarmAttentionRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := category.NewGetFarmAttentionLogic(r.Context(), svcCtx)
		resp, err := l.GetFarmAttention(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
