package attention

import (
	"net/http"

	"Server_gozero/CS/commodityServer/api/internal/logic/attention"
	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func DelAttentionHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.DelAttentionRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := attention.NewDelAttentionLogic(r.Context(), svcCtx)
		resp, err := l.DelAttention(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
