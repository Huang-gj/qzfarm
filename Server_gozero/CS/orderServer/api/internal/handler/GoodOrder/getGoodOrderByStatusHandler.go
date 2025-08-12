package GoodOrder

import (
	"net/http"

	"Server_gozero/CS/orderServer/api/internal/logic/GoodOrder"
	"Server_gozero/CS/orderServer/api/internal/svc"
	"Server_gozero/CS/orderServer/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func GetGoodOrderByStatusHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.GetGoodOrderByStatusRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := GoodOrder.NewGetGoodOrderByStatusLogic(r.Context(), svcCtx)
		resp, err := l.GetGoodOrderByStatus(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
