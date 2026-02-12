package store

import "time"

type IPBlock struct {
	IP           string `gorm:"primaryKey"`
	Reason       string
	BlockedAt    time.Time
	ExpiresAt    time.Time
	FailCount    int `gorm:"default:1"`
	LastFailTime int64
	CreatedAt    time.Time `gorm:"autoCreateTime"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime"`
}

type IPWhitelist struct {
	IP        string `gorm:"primaryKey"`
	Note      string
	CreatedAt time.Time `gorm:"autoCreateTime"`
}
