package common

import (
	"github.com/golang-jwt/jwt/v4"
)

// GetJwtToken 生成JWT token
func GetJwtToken(secretKey string, iat, seconds, userId int64) (string, error) {
	claims := make(jwt.MapClaims)
	claims["exp"] = iat + seconds
	claims["iat"] = iat
	claims["userId"] = userId
	claims["author"] = "huang" // 添加一些自定义的kv
	token := jwt.New(jwt.SigningMethodHS256)
	token.Claims = claims
	return token.SignedString([]byte(secretKey))
} 