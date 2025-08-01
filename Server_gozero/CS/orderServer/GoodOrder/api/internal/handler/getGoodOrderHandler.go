package handler

import (
	"net/http"

	"Server_gozero/CS/orderServer/GoodOrder/api/internal/logic"
	"Server_gozero/CS/orderServer/GoodOrder/api/internal/svc"
	"Server_gozero/CS/orderServer/GoodOrder/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func GetGoodOrderHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.GetGoodOrderRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewGetGoodOrderLogic(r.Context(), svcCtx)
		resp, err := l.GetGoodOrder(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
