package logic

import (
	"Server/model/project_interface"
	"github.com/dgrijalva/jwt-go"
	"time"
)

var jwtKey = []byte("huang") //证书签名秘钥（该秘钥非常重要，如果client端有该秘钥，就可以签发证书了）

type Claims struct {
	UserId int
	jwt.StandardClaims
}

// 分发证书
func ReleaseToken(user model.UserInfo) (string, error) {
	expirationTime := time.Now().Add(7 * 24 * time.Hour) //截止时间：从当前时刻算起，7天
	claims := &Claims{
		UserId: user.UserID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(), //过期时间
			IssuedAt:  time.Now().Unix(),     //发布时间
			Subject:   "user token",          //主题
			//发布者
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims) //生成token
	tokenString, err := token.SignedString(jwtKey)             //签名

	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// 解析证书
func ParseToken(tokenString string) (*jwt.Token, *Claims, error) {
	var claims Claims
	token, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	if err != nil {
		return token, nil, err
	}
	return token, &claims, nil
}
