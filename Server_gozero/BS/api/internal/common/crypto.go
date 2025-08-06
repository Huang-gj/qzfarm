package common

import (
	"crypto/md5"
	"encoding/hex"
)

var secret = []byte("江城路")

// PasswordMd5 密码MD5加密
func PasswordMd5(password []byte) string {
	h := md5.New()
	h.Write(password) // 密码计算md5
	h.Write(secret)   // 加盐
	return hex.EncodeToString(h.Sum(nil))
}
