package SaleData

import (
	"net/http"

	"Server_gozero/BS/api/internal/logic/SaleData"
	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func SaleSummaryHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.SaleSummaryRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := SaleData.NewSaleSummaryLogic(r.Context(), svcCtx)
		resp, err := l.SaleSummary(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
