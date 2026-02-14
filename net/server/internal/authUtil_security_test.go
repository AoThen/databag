package databag

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

// TestSecureStringCompare tests the timing-safe string comparison function
func TestSecureStringCompare(t *testing.T) {
	// Test case 1: Equal strings
	if !secureStringCompare("test", "test") {
		t.Error("secureStringCompare failed for equal strings")
	}

	// Test case 2: Different strings with same length
	if secureStringCompare("test", "tost") {
		t.Error("secureStringCompare incorrectly returned true for different strings")
	}

	// Test case 3: Different strings with different length
	if secureStringCompare("test", "testing") {
		t.Error("secureStringCompare incorrectly returned true for strings of different length")
	}

	// Test case 4: Empty strings
	if !secureStringCompare("", "") {
		t.Error("secureStringCompare failed for empty strings")
	}
}

// TestTimingAttackPrevention tests that timing attacks are prevented
func TestTimingAttackPrevention(t *testing.T) {
	// Simulate a timing attack test
	const realToken = "valid_admin_token_12345"
	const wrongToken = "invalid_token_67890"

	// Test that legitimate token comparison works
	if !secureStringCompare(realToken, realToken) {
		t.Error("Legitimate token comparison failed")
	}

	// Test that wrong token comparison fails
	if secureStringCompare(realToken, wrongToken) {
		t.Error("Wrong token comparison should fail")
	}

	// Test timing consistency by running many comparisons
	// In a timing attack, the comparison time would vary based on how many characters match
	const iterations = 1000
	var times []int64

	for i := 0; i < iterations; i++ {
		start := time.Now()
		secureStringCompare(realToken, wrongToken)
		duration := time.Since(start).Nanoseconds()
		times = append(times, duration)
	}

	// Check that timing is consistent (all comparisons should take similar time)
	// Allow for some variation due to system load, but should be within reasonable bounds
	maxTime := times[0]
	minTime := times[0]

	for _, duration := range times {
		if duration > maxTime {
			maxTime = duration
		}
		if duration < minTime {
			minTime = duration
		}
	}

	// Calculate variation percentage
	variation := float64(maxTime-minTime) / float64(minTime) * 100

	// Variation should be less than 20% for timing-safe comparison
	if variation > 20.0 {
		t.Errorf("Timing variation too high: %f%% (should be < 20%%)", variation)
	}
}

// TestSessionTokenTimingAttack simulates timing attack on session token validation
func TestSessionTokenTimingAttack(t *testing.T) {
	// Create HTTP request handler similar to ParamSessionToken
	handler := func(w http.ResponseWriter, r *http.Request) {
		token := r.FormValue("token")

		// Use secure comparison (this is what we're testing)
		if secureStringCompare("real_session_token", token) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("success"))
		} else {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("unauthorized"))
		}
	}

	// Test 1: Valid token
	req1 := httptest.NewRequest("GET", "/test?token=real_session_token", nil)
	rr1 := httptest.NewRecorder()
	handler(rr1, req1)

	if rr1.Code != http.StatusOK {
		t.Error("Valid token should return 200")
	}

	// Test 2: Invalid token with timing attack simulation
	// We'll make multiple requests to see if timing differs
	var invalidTokens = []string{
		"a", "ab", "abc", "real_session_toke", "real_session_token_",
	}

	for _, token := range invalidTokens {
		req := httptest.NewRequest("GET", "/test?token="+token, nil)
		rr := httptest.NewRecorder()

		start := time.Now()
		handler(rr, req)
		duration := time.Since(start)

		if rr.Code != http.StatusUnauthorized {
			t.Errorf("Invalid token %s should return 401", token)
		}

		// All invalid tokens should take similar time (within reasonable variation)
		if duration.Nanoseconds() > 100000000 { // 100ms threshold
			t.Errorf("Invalid token comparison took too long: %v", duration)
		}
	}
}
