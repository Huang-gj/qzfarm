package response

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// 目前设置好的bizCode:
// HTTP状态码	业务错误码	错误类型		适用场景
// 200			20000		成功			默认成功状态
// 400			40001		参数校验失败	请求参数缺失或格式错误
// 401			40101		未授权访问	用户未登录或 Token 过期
// 403			40301		权限不足		用户无操作权限（如删除他人评论）
// 404			40401		资源不存在	查询的评论/商品/用户不存在
// 409			40901		资源冲突		重复提交评论
// 422			42201		业务逻辑错误	评论字数超限、图片违规
// 429			42901		请求频率超限	短时间频繁提交评论
// 500			50001		服务器内部错误	数据库连接失败、未知异常

// 基础响应结构
func Response(ctx *gin.Context, httpStatus int, bizCode int, data gin.H, msg string) {
	ctx.JSON(httpStatus, gin.H{
		"code": httpStatus, // 业务错误码
		"data": data,
		"msg":  msg,
	})
}

// 成功响应
func Success(ctx *gin.Context, data gin.H, msg string) {
	Response(ctx, http.StatusOK, 20000, data, msg)
}

// 通用失败响应 (支持自定义业务码)
func Fail(ctx *gin.Context, httpStatus int, bizCode int, data gin.H, msg string) {
	Response(ctx, httpStatus, bizCode, data, msg)
}

// ---------------------------
// 常用错误响应快捷方法
// ---------------------------

// 参数错误 (HTTP 400)
func BadRequest(ctx *gin.Context, msg string, data gin.H) {
	if msg == "" {
		msg = "请求参数不合法"
	}
	Fail(ctx, http.StatusBadRequest, 40001, data, msg)
}

// 未授权 (HTTP 401)
func Unauthorized(ctx *gin.Context, msg string, data gin.H) {
	if msg == "" {
		msg = "身份验证失败，请重新登录"
	}
	Fail(ctx, http.StatusUnauthorized, 40101, data, msg)
}

// 禁止访问 (HTTP 403)
func Forbidden(ctx *gin.Context, msg string, data gin.H) {
	if msg == "" {
		msg = "权限不足，拒绝访问"
	}
	Fail(ctx, http.StatusForbidden, 40301, data, msg)
}

// 资源不存在 (HTTP 404)
func NotFound(ctx *gin.Context, msg string, data gin.H) {
	if msg == "" {
		msg = "请求的资源不存在"
	}
	Fail(ctx, http.StatusNotFound, 40401, data, msg)
}

// 业务逻辑错误 (HTTP 422)
func UnprocessableEntity(ctx *gin.Context, msg string, data gin.H) {
	if msg == "" {
		msg = "操作无法处理"
	}
	Fail(ctx, http.StatusUnprocessableEntity, 42201, data, msg)
}

// 频率限制 (HTTP 429)
func TooManyRequests(ctx *gin.Context, msg string, data gin.H) {
	if msg == "" {
		msg = "请求过于频繁，请稍后再试"
	}
	Fail(ctx, http.StatusTooManyRequests, 42901, data, msg)
}

// 服务器错误 (HTTP 500)
func InternalServerError(ctx *gin.Context, msg string, data gin.H) {
	if msg == "" {
		msg = "服务器内部错误，请稍后重试"
	}
	Fail(ctx, http.StatusInternalServerError, 50001, data, msg)
}
