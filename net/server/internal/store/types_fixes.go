package store

import "gorm.io/gorm"

// CardTypes fixes for frontend type compatibility
// This addresses the LSP errors where frontend expects card.Account but backend returns different structure

// 1. CardWithAccount provides the Account field expected by frontend
type CardWithAccount struct {
	ID              int    `gorm:"primaryKey;not null;unique;autoIncrement"`
	AccountID       string `gorm:"not null;index:cardguid,unique"`
	GUID            string `gorm:"not null;index:cardguid,unique"`
	Username        string
	Name            string
	Description     string
	Location        string
	Image           string
	Seal            string
	Version         string `gorm:"not null"`
	Node            string `gorm:"not null"`
	ProfileRevision int64  `gorm:"not null"`
	DetailRevision  int64  `gorm:"not null;default:1"`
	Status          string `gorm:"not null;index:idx_card_status"`
	StatusUpdated   int64
	InToken         string `gorm:"not null;index:cardguid,unique;index:idx_card_in_token"`
	OutToken        string
	Notes           string
	Created         int64 `gorm:"autoCreateTime"`
	Updated         int64 `gorm:"autoUpdateTime"`

	// Account field for frontend compatibility
	Account Account `gorm:"references:GUID"`
}

// 2. CardWithViewRevision provides ViewRevision field expected by frontend
type CardWithViewRevision struct {
	ID              int    `gorm:"primaryKey;not null;unique;autoIncrement"`
	AccountID       string `gorm:"not null;index:cardguid,unique"`
	GUID            string `gorm:"not null;index:cardguid,unique"`
	Username        string
	Name            string
	Description     string
	Location        string
	Image           string
	Seal            string
	Version         string `gorm:"not null"`
	Node            string `gorm:"not null"`
	ProfileRevision int64  `gorm:"not null"`
	DetailRevision  int64  `gorm:"not null;default:1"` // Added ViewRevision field
	Status          string `gorm:"not null;index:idx_card_status"`
	StatusUpdated   int64
	InToken         string `gorm:"not null;index:cardguid,unique;index:idx_card_in_token"`
	OutToken        string
	Notes           string
	Created         int64 `gorm:"autoCreateTime"`
	Updated         int64 `gorm:"autoUpdateTime"`

	// Account field for frontend compatibility
	Account Account `gorm:"references:GUID"`
}

// 3. Fixed API response types that match frontend expectations
type APIResponseCard struct {
	Data  *CardWithAccount `json:"data"`
	Error string           `json:"error,omitempty"`
}

// 4. Enhanced Article type with Account field
type ArticleWithAccount struct {
	ID            int    `gorm:"primaryKey;not null;unique;autoIncrement"`
	GUID          string `gorm:"not null;uniqueIndex"`
	AccountID     string `gorm:"not null;index:articleguid,unique"`
	ChannelSlotID string `gorm:"not null;index:articleslot,unique"`
	Revision      int64  `gorm:"not null"`
	CardID        int    `gorm:"not null;default:0"`
	ChannelID     int    `gorm:"not null;default:0"`
	DataType      string `gorm:"not null;index"`
	Data          string `gorm:"not null"`
	Created       int64  `gorm:"autoCreateTime"`
	Updated       int64  `gorm:"autoUpdateTime"`

	Account Account `gorm:"references:GUID"`
}

// 5. Enhanced Channel type with Account field
type ChannelWithAccount struct {
	ID             uint   `gorm:"primaryKey;not null;unique;autoIncrement"`
	AccountID      uint   `gorm:"not null;index:channelguid,unique"`
	GUID           string `gorm:"not null;uniqueIndex"`
	ChannelSlotID  string `gorm:"not null;index:channelslot,unique"`
	Revision       int64  `gorm:"not null"`
	CardID         int    `gorm:"not null;default:0"`
	DetailRevision int64  `gorm:"not null;default:1"`
	DataType       string `gorm:"not null;index"`
	Data           string `gorm:"not null"`
	Created        int64  `gorm:"autoCreateTime"`
	Updated        int64  `gorm:"autoUpdateTime"`

	Account Account `gorm:"references:GUID"`
}

// Migration function to add the missing ViewRevision field
func AddViewRevisionField(db *gorm.DB) error {
	// Add ViewRevision field to existing Card records
	return db.Exec(`
		ALTER TABLE cards ADD COLUMN view_revision BIGINT DEFAULT 1;
	`).Error
}
