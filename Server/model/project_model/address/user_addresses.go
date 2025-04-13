package address

type UserAddress struct {
	AddressID       int     `gorm:"primaryKey;autoIncrement" json:"address_id"` // 地址ID
	SaaSID          string  `gorm:"size:128" json:"saas_id"`                    // SaaS ID
	Uid             int     `json:"uid"`                                        // 用户ID
	AuthToken       string  `gorm:"size:128" json:"auth_token"`                 // 授权Token
	Phone           string  `gorm:"size:20" json:"phone"`                       // 联系电话
	Name            string  `gorm:"size:128" json:"name"`                       // 用户姓名
	CountryName     string  `gorm:"size:128" json:"country_name"`               // 国家名称
	CountryCode     string  `gorm:"size:10" json:"country_code"`                // 国家代码
	ProvinceName    string  `gorm:"size:128" json:"province_name"`              // 省份名称
	ProvinceCode    string  `gorm:"size:20" json:"province_code"`               // 省份代码
	CityName        string  `gorm:"size:128" json:"city_name"`                  // 城市名称
	CityCode        string  `gorm:"size:20" json:"city_code"`                   // 城市代码
	DistrictName    string  `gorm:"size:128" json:"district_name"`              // 区县名称
	DistrictCode    string  `gorm:"size:20" json:"district_code"`               // 区县代码
	DetailAddress   string  `gorm:"size:128" json:"detail_address"`             // 详细地址
	IsDefault       int     `json:"is_default"`                                 // 是否为默认地址（0=否，1=是）
	AddressTag      string  `gorm:"size:50" json:"address_tag"`                 // 地址标签（如：公司、家庭等）
	Latitude        float64 `gorm:"type:decimal(9,6)" json:"latitude"`          // 纬度
	Longitude       float64 `gorm:"type:decimal(9,6)" json:"longitude"`         // 经度
	DistanceToFarm  float64 `gorm:"type:decimal(10,2)" json:"distance_to_farm"` // 到农场的距离(公里)
	InDeliveryRange bool    `gorm:"default:true" json:"in_delivery_range"`      // 是否在配送范围内
}
