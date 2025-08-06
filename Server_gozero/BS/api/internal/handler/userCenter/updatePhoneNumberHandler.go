package userCenter

import (
	"net/http"

	"Server_gozero/BS/api/internal/logic/userCenter"
	"Server_gozero/BS/api/internal/svc"
	"Server_gozero/BS/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func UpdatePhoneNumberHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.UpdatePhoneNumberRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := userCenter.NewUpdatePhoneNumberLogic(r.Context(), svcCtx)
		resp, err := l.UpdatePhoneNumber(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
