package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"sync/atomic"
	"time"
)

// 用户信息结构
type UserAccount struct {
	ID          int64
	PhoneNumber string
	Password    string
	Token       string
}

// 登录请求结构
type LoginRequest struct {
	PhoneNumber string `json:"phone_number"`
	Password    string `json:"password"`
}

// 登录响应结构
type LoginResponse struct {
	Code         int    `json:"code"`
	Msg          string `json:"msg"`
	AccessToken  string `json:"accessToken"`
	AccessExpire int    `json:"accessExpire"`
	RefreshAfter int    `json:"refreshAfter"`
}

// 订单请求结构
type AddGoodOrder struct {
	ImageUrls   string  `json:"image_urls"`
	GoodId      int64   `json:"good_id"`
	FarmId      int64   `json:"farm_id"`
	UserId      int64   `json:"user_id"`
	UserAddress string  `json:"user_address"`
	FarmAddress string  `json:"farm_address"`
	Price       float64 `json:"price"`
	Units       string  `json:"units"`
	Count       int64   `json:"count"`
	Detail      string  `json:"detail"`
	OrderStatus string  `json:"order_status"`
}

type AddGoodOrderRequest struct {
	GoodOrder AddGoodOrder `json:"good_order"`
}

type AddGoodOrderResponse struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
}

// 用户登录函数
func loginUser(user UserAccount) (string, error) {
	loginReq := LoginRequest{
		PhoneNumber: user.PhoneNumber,
		Password:    user.Password,
	}

	body, _ := json.Marshal(loginReq)
	req, err := http.NewRequest("POST", "http://localhost:8888/api/userLogin", bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("构造登录请求失败: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("登录请求失败: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("登录失败，状态码: %d", resp.StatusCode)
	}

	var loginResp LoginResponse
	if err := json.NewDecoder(resp.Body).Decode(&loginResp); err != nil {
		return "", fmt.Errorf("解析登录响应失败: %v", err)
	}

	if loginResp.Code != 200 {
		return "", fmt.Errorf("登录失败: %s", loginResp.Msg)
	}

	return loginResp.AccessToken, nil
}

// 下单函数
func placeOrder(user UserAccount, orderIndex int) error {
	order := AddGoodOrderRequest{
		GoodOrder: AddGoodOrder{
			ImageUrls:   "",
			GoodId:      1000,
			FarmId:      1,
			UserId:      user.ID,
			UserAddress: "测试地址A",
			FarmAddress: "农场地址B",
			Price:       9.9,
			Units:       "kg",
			Count:       1,
			Detail:      fmt.Sprintf("用户%d的并发测试订单%d", user.ID, orderIndex),
			OrderStatus: "pending",
		},
	}

	body, _ := json.Marshal(order)
	req, err := http.NewRequest("POST", "http://localhost:8891/api/AddGoodOrder", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("构造下单请求失败: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+user.Token)

	client := http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("下单请求失败: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("下单失败，状态码: %d", resp.StatusCode)
	}

	var orderResp AddGoodOrderResponse
	if err := json.NewDecoder(resp.Body).Decode(&orderResp); err != nil {
		return fmt.Errorf("解析下单响应失败: %v", err)
	}

	if orderResp.Code != 200 {
		return fmt.Errorf("下单失败: %s", orderResp.Msg)
	}

	return nil
}

func main() {
	// 定义四个用户账号
	users := []UserAccount{
		{ID: 133, PhoneNumber: "18958138836", Password: "123456"},
		{ID: 134, PhoneNumber: "18958138839", Password: "123456"},
		{ID: 135, PhoneNumber: "18958138840", Password: "123456"},
		{ID: 136, PhoneNumber: "18958138835", Password: "123456"},
	}

	// 并发参数
	concurrency := 3 // 每个用户并发下单数
	totalUsers := len(users)

	fmt.Println("========== 开始压力测试 ==========")
	fmt.Printf("用户数量: %d\n", totalUsers)
	fmt.Printf("每个用户并发下单数: %d\n", concurrency)
	fmt.Printf("总并发请求数: %d\n", totalUsers*concurrency)

	// 第一步：所有用户登录获取token
	fmt.Println("\n========== 用户登录阶段 ==========")
	for i, user := range users {
		token, err := loginUser(user)
		if err != nil {
			fmt.Printf("用户%d登录失败: %v\n", user.ID, err)
			return
		}
		users[i].Token = token
		fmt.Printf("用户%d登录成功，获取token\n", user.ID)
	}

	// 第二步：并发下单测试
	fmt.Println("\n========== 并发下单测试 ==========")
	var wg sync.WaitGroup
	var successCount, failCount int32
	var userSuccessCount [4]int32 // 每个用户的成功计数

	start := time.Now()

	// 为每个用户启动并发协程
	for userIndex, user := range users {
		for i := 0; i < concurrency; i++ {
			wg.Add(1)
			time.Sleep(100 * time.Millisecond)
			go func(userIdx int, u UserAccount, orderIdx int) {
				defer wg.Done()

				err := placeOrder(u, orderIdx)
				if err != nil {
					fmt.Printf("用户%d下单失败: %v\n", u.ID, err)
					atomic.AddInt32(&failCount, 1)
				} else {
					atomic.AddInt32(&successCount, 1)
					atomic.AddInt32(&userSuccessCount[userIdx], 1)
				}
			}(userIndex, user, i)
		}
	}

	wg.Wait()

	elapsed := time.Since(start)

	// 输出测试结果
	fmt.Println("\n========== 压力测试结果 ==========")
	fmt.Printf("总请求数: %d\n", totalUsers*concurrency)
	fmt.Printf("成功下单: %d\n", successCount)
	fmt.Printf("失败请求: %d\n", failCount)
	fmt.Printf("总耗时: %s\n", elapsed)
	fmt.Printf("平均响应时间: %s\n", elapsed/time.Duration(totalUsers*concurrency))

	fmt.Println("\n========== 各用户下单统计 ==========")
	for i, user := range users {
		fmt.Printf("用户%d (ID:%d): 成功%d次\n", i+1, user.ID, userSuccessCount[i])
	}

	fmt.Println("\n========== 测试完成 ==========")
}
