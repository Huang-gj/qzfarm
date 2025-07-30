package handler

import (
	"net/http"

	"Server_gozero/CS/orderServer/LandOrder/api/internal/logic"
	"Server_gozero/CS/orderServer/LandOrder/api/internal/svc"
	"Server_gozero/CS/orderServer/LandOrder/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func UpdateOrderCountHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.UpdateOrderCountRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewUpdateOrderCountLogic(r.Context(), svcCtx)
		resp, err := l.UpdateOrderCount(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
