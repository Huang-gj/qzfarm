package LandOrder

import (
	"net/http"

	"Server_gozero/CS/orderServer/api/internal/logic/LandOrder"
	"Server_gozero/CS/orderServer/api/internal/svc"
	"Server_gozero/CS/orderServer/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func GetLandOrderHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.GetLandOrderRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := LandOrder.NewGetLandOrderLogic(r.Context(), svcCtx)
		resp, err := l.GetLandOrder(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
