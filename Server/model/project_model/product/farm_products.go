package product

import (
	"gorm.io/datatypes"
	"time"
)

type FarmProduct struct {
	ProductID        int            `gorm:"primaryKey;autoIncrement" json:"product_id"`
	FarmID           int            `gorm:"not null" json:"farm_id"`
	Title            string         `gorm:"size:128;not null" json:"title"`
	PrimaryImage     string         `gorm:"size:512" json:"primary_image"`
	Price            float64        `gorm:"type:decimal(10,2);not null" json:"price"`
	StockQuantity    int            `gorm:"not null" json:"stock_quantity"`
	SoldNum          int            `gorm:"default:0" json:"sold_num"`
	IsAvailable      bool           `gorm:"default:true" json:"is_available"`
	Unit             string         `gorm:"size:50;not null" json:"unit"`
	Description      string         `gorm:"type:text" json:"description"`
	Images           datatypes.JSON `gorm:"type:json" json:"images"`
	CategoryID       int            `json:"category_id"`
	IsFeatured       bool           `gorm:"default:false" json:"is_featured"`
	HarvestDate      time.Time      `gorm:"type:date" json:"harvest_date"`
	FreshnessPeriod  int            `json:"freshness_period"`
	GrowthCycle      int            `json:"growth_cycle"`
	PlantingMethod   string         `gorm:"size:128" json:"planting_method"`
	OrganicCertified bool           `gorm:"default:false" json:"organic_certified"`
	PesticideFree    bool           `gorm:"default:false" json:"pesticide_free"`
	FertilizerUsed   string         `gorm:"size:128" json:"fertilizer_used"`
	HarvestID        int            `json:"harvest_id"`
	FarmUnitID       int            `json:"farm_unit_id"`
	NutritionalValue string         `gorm:"type:text" json:"nutritional_value"`
	StorageMethod    string         `gorm:"size:128" json:"storage_method"`
	CreatedAt        time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
}
