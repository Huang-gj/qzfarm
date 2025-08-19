package user

// CustomerServiceInfo 用于存储客户服务信息
type CustomerServiceInfo struct {
	ServiceID              int    `gorm:"primaryKey;autoIncrement" json:"service_id"`    // 服务ID
	ServicePhone           string `gorm:"size:20" json:"service_phone"`                  // 客服电话
	ServiceTimeDuration    string `gorm:"size:128" json:"service_time_duration"`         // 客服服务时间（如"9:00-18:00"）
	FarmID                 int    `json:"farm_id"`                                       // 关联农场ID
	FarmServicePhone       string `gorm:"size:20" json:"farm_service_phone"`             // 农场客服电话
	FarmerConsultAvailable bool   `gorm:"default:false" json:"farmer_consult_available"` // 是否提供农场咨询服务
	FarmVisitBooking       bool   `gorm:"default:false" json:"farm_visit_booking"`       // 是否支持预约农场参观
}
