package order

import (
	"net/http"

	"Server_gozero/BS/api/internal/logic/order"
	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func GetGoodOrderHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.GetGoodOrderRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := order.NewGetGoodOrderLogic(r.Context(), svcCtx)
		resp, err := l.GetGoodOrder(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
