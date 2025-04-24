package farm

import (
	"gorm.io/datatypes"
	"time"
)

type Farm struct {
	FarmID            int            `gorm:"primaryKey;autoIncrement" json:"farm_id"` // 农场ID
	FarmName          string         `gorm:"size:128;not null" json:"farm_name"`      // 农场名称
	OwnerID           int            `json:"owner_id"`                                // 农场主用户ID
	Description       string         `gorm:"type:text" json:"description"`            // 农场描述
	Location          string         `gorm:"size:128" json:"location"`                // 农场位置描述
	AddressDetail     string         `gorm:"type:text" json:"address_detail"`         // 详细地址
	Latitude          float64        `gorm:"type:decimal(9,6)" json:"latitude"`       // 纬度
	Longitude         float64        `gorm:"type:decimal(9,6)" json:"longitude"`      // 经度
	FarmSize          float64        `gorm:"type:decimal(10,2)" json:"farm_size"`     // 农场总面积(亩)
	FarmType          int            `json:"farm_type"`                               // 农场类型(1=...,2=...,3=...)
	Certification     string         `gorm:"size:128" json:"certification"`           // 农场认证情况
	MainProducts      string         `gorm:"type:text" json:"main_products"`          // 主要产品
	LogoURL           string         `gorm:"size:512" json:"logo_url"`                // 农场logo
	ImageURLs         datatypes.JSON `gorm:"type:json" json:"image_urls"`             // 农场照片（JSON数组）
	ContactPhone      string         `gorm:"size:20" json:"contact_phone"`            // 联系电话
	EstablishmentDate time.Time      `gorm:"type:date" json:"establishment_date"`     // 成立日期
	BusinessHours     string         `gorm:"size:128" json:"business_hours"`          // 营业时间
	FarmFeatures      datatypes.JSON `gorm:"type:json" json:"farm_features"`          // 农场特色（JSON对象）
	AverageRating     float64        `gorm:"type:decimal(2,1)" json:"average_rating"` // 平均评分
	Status            int            `gorm:"default:1" json:"status"`                 // 状态(1=正常营业,0=暂停营业)
	CreatedAt         time.Time      `gorm:"autoCreateTime" json:"created_at"`        // 创建时间
	UpdatedAt         time.Time      `gorm:"autoUpdateTime" json:"updated_at"`        // 更新时间
}
