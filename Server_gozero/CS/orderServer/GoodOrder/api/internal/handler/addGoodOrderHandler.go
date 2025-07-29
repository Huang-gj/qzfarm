package handler

import (
	"net/http"

	"Server_gozero/CS/orderServer/GoodOrder/api/internal/logic"
	"Server_gozero/CS/orderServer/GoodOrder/api/internal/svc"
	"Server_gozero/CS/orderServer/GoodOrder/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func AddGoodOrderHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.AddGoodOrderRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewAddGoodOrderLogic(r.Context(), svcCtx)
		resp, err := l.AddGoodOrder(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
