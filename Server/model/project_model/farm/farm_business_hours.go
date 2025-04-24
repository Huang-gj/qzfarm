package farm

// FarmBusinessHours 用于存储农场营业时间信息
type FarmBusinessHours struct {
	ID        int    `gorm:"primaryKey;autoIncrement" json:"id"` // 时间记录ID
	FarmID    int    `gorm:"not null" json:"farm_id"`            // 关联农场ID
	DayOfWeek int    `json:"day_of_week"`                        // 周几（1-7）
	OpenTime  string `gorm:"type:time" json:"open_time"`         // 开始时间
	CloseTime string `gorm:"type:time" json:"close_time"`        // 结束时间
	IsClosed  bool   `gorm:"default:false" json:"is_closed"`     // 是否休息（true=休息，false=营业）
}
