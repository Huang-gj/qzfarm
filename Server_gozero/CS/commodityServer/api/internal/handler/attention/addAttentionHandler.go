package attention

import (
	"net/http"

	"Server_gozero/CS/commodityServer/api/internal/logic/attention"
	"Server_gozero/CS/commodityServer/api/internal/svc"
	"Server_gozero/CS/commodityServer/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func AddAttentionHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.AddAttentionRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := attention.NewAddAttentionLogic(r.Context(), svcCtx)
		resp, err := l.AddAttention(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
