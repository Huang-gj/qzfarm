package middleware

import (
	"Server/logic"
	"Server/response"
	"fmt"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware token认证中间件（权限控制）
func AuthMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var tokenString string

		// 首先尝试从Cookie中获取token
		tokenString, err := ctx.Cookie("token")
		if err != nil {
			// 如果Cookie中没有，则尝试从Header中获取
			tokenString = ctx.Request.Header.Get("Authorization")
			if tokenString == "" {
				response.Unauthorized(ctx, "请先登录", nil)
				ctx.Abort()
				return
			}
			// 去除"Bearer "前缀
			if len(tokenString) > 7 && tokenString[0:7] == "Bearer " {
				tokenString = tokenString[7:]
			}
		}

		token, claims, err := logic.ParseToken(tokenString)
		fmt.Println(tokenString)
		fmt.Println(token, err)
		if err != nil || !token.Valid {
			response.Unauthorized(ctx, "登录已过期，请重新登录", nil)
			ctx.Abort()
			return
		}

		// 验证通过后的操作...
		ctx.Set("user", claims) // 将claims存储到context中
		ctx.Next()
	}
}
