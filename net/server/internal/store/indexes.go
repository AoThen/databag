package store

import (
	"gorm.io/gorm"
)

// AddPerformanceIndexes adds missing performance indexes to improve query performance
func AddPerformanceIndexes(db *gorm.DB) error {
	// Create missing indexes for TopicRead table
	indexes := []string{
		// TopicRead table indexes
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_topicread_account ON topic_reads (account_id)",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_topicread_read_time ON topic_reads (read_time DESC)",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_topicread_topic_account ON topic_reads (topic_id, account_id)",

		// Card table indexes for better authentication queries
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_card_in_token ON cards (in_token)",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_card_status ON cards (status)",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_card_account_status ON cards (account_id, status)",

		// Channel table indexes
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_channel_account ON channels (account_id)",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_channel_account_revision ON channels (account_id, revision DESC)",

		// Account table indexes
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_account_disabled ON accounts (disabled)",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_account_updated ON accounts (updated DESC)",

		// Asset table indexes
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_asset_account ON assets (account_id)",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_asset_created ON assets (created DESC)",
	}

	for _, indexSQL := range indexes {
		if err := db.Exec(indexSQL).Error; err != nil {
			return err
		}
	}

	return nil
}

// AnalyzeSlowQueries returns common slow query patterns and their recommended indexes
func AnalyzeSlowQueries(db *gorm.DB) error {
	// This function can be used to identify slow queries
	// Common slow patterns:
	// 1. Finding unread messages for a user
	// 2. Channel topic listing with revisions
	// 3. Card authentication queries

	analysisQueries := []string{
		// Check for slow TopicRead queries
		"EXPLAIN QUERY SELECT * FROM topic_reads WHERE account_id = ? AND read_time > ? ORDER BY read_time DESC LIMIT 100",

		// Check for slow Card queries
		"EXPLAIN QUERY SELECT * FROM cards WHERE account_id = ? AND in_token = ?",

		// Check for slow Channel queries
		"EXPLAIN QUERY SELECT * FROM channels WHERE account_id = ? ORDER BY revision DESC LIMIT 50",
	}

	for _, query := range analysisQueries {
		if err := db.Exec(query).Error; err != nil {
			return err
		}
	}

	return nil
}

// DropIndexsWithPrefix removes indexes with a specific prefix (useful for testing)
func DropIndexsWithPrefix(db *gorm.DB, prefix string) error {
	return db.Exec("SELECT indexname FROM pg_indexes WHERE indexname LIKE ?", prefix+"%").Error
}
