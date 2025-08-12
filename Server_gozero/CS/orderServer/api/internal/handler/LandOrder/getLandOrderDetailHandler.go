package LandOrder

import (
	"net/http"

	"Server_gozero/CS/orderServer/api/internal/logic/LandOrder"
	"Server_gozero/CS/orderServer/api/internal/svc"
	"Server_gozero/CS/orderServer/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func GetLandOrderDetailHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.GetLandOrderDetailRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := LandOrder.NewGetLandOrderDetailLogic(r.Context(), svcCtx)
		resp, err := l.GetLandOrderDetail(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
