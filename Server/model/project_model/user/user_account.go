package user

// UserAccount 用于存储用户账户信息
type UserAccount struct {
	AccountID    int    `gorm:"primaryKey;autoIncrement" json:"account_id"` // 账户ID
	UserID       int    `gorm:"index" json:"user_id"`                       // 用户ID
	Num          int    `json:"num"`                                        // 账户余额/积分数量
	Name         string `gorm:"size:50" json:"name"`                        // 账户名称（如积分、余额）
	Type         string `gorm:"size:50" json:"type"`                        // 账户类型（如'积分'、'余额'）
	FarmID       int    `json:"farm_id"`                                    // 关联农场ID
	FarmPoints   int    `gorm:"default:0" json:"farm_points"`               // 用户在特定农场的积分
	AdoptionDays int    `gorm:"default:0" json:"adoption_days"`             // 用户认养天数
}
