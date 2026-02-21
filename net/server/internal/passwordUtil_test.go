package databag

import (
	"os"
	"strings"
	"testing"
)

func TestValidatePasswordStrength(t *testing.T) {
	// Save original env values
	origMinLength := os.Getenv("DATABAG_PASSWORD_MIN_LENGTH")
	origMaxLength := os.Getenv("DATABAG_PASSWORD_MAX_LENGTH")
	origRequireUpper := os.Getenv("DATABAG_PASSWORD_REQUIRE_UPPER")
	origRequireLower := os.Getenv("DATABAG_PASSWORD_REQUIRE_LOWER")
	origRequireNumber := os.Getenv("DATABAG_PASSWORD_REQUIRE_NUMBER")
	origRequireSpecial := os.Getenv("DATABAG_PASSWORD_REQUIRE_SPECIAL")

	// Restore env values after test
	defer func() {
		os.Setenv("DATABAG_PASSWORD_MIN_LENGTH", origMinLength)
		os.Setenv("DATABAG_PASSWORD_MAX_LENGTH", origMaxLength)
		os.Setenv("DATABAG_PASSWORD_REQUIRE_UPPER", origRequireUpper)
		os.Setenv("DATABAG_PASSWORD_REQUIRE_LOWER", origRequireLower)
		os.Setenv("DATABAG_PASSWORD_REQUIRE_NUMBER", origRequireNumber)
		os.Setenv("DATABAG_PASSWORD_REQUIRE_SPECIAL", origRequireSpecial)
	}()

	tests := []struct {
		name           string
		password       string
		minLength      string
		maxLength      string
		requireUpper   string
		requireLower   string
		requireNumber  string
		requireSpecial string
		expectError    bool
		errorCode      string
	}{
		{
			name:        "valid password with default settings",
			password:    "MyP@ssw0rd",
			minLength:   "8",
			maxLength:   "128",
			expectError: false,
		},
		{
			name:        "password too short",
			password:    "short",
			minLength:   "8",
			maxLength:   "128",
			expectError: true,
			errorCode:   "min_length",
		},
		{
			name:        "password too long",
			password:    strings.Repeat("a", 129),
			minLength:   "8",
			maxLength:   "128",
			expectError: true,
			errorCode:   "max_length",
		},
		{
			name:         "missing uppercase",
			password:     "mypassword123",
			minLength:    "8",
			maxLength:    "128",
			requireUpper: "true",
			expectError:  true,
			errorCode:    "missing_upper",
		},
		{
			name:         "missing lowercase",
			password:     "MYPASSWORD123",
			minLength:    "8",
			maxLength:    "128",
			requireLower: "true",
			expectError:  true,
			errorCode:    "missing_lower",
		},
		{
			name:          "missing number",
			password:      "MyPassword",
			minLength:     "8",
			maxLength:     "128",
			requireNumber: "true",
			expectError:   true,
			errorCode:     "missing_number",
		},
		{
			name:           "missing special character",
			password:       "MyPassword123",
			minLength:      "8",
			maxLength:      "128",
			requireSpecial: "true",
			expectError:    true,
			errorCode:      "missing_special",
		},
		{
			name:           "valid password with all requirements",
			password:       "MyP@ssw0rd",
			minLength:      "8",
			maxLength:      "128",
			requireUpper:   "true",
			requireLower:   "true",
			requireNumber:  "true",
			requireSpecial: "true",
			expectError:    false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Set environment variables for this test case
			os.Setenv("DATABAG_PASSWORD_MIN_LENGTH", tt.minLength)
			os.Setenv("DATABAG_PASSWORD_MAX_LENGTH", tt.maxLength)
			if tt.requireUpper != "" {
				os.Setenv("DATABAG_PASSWORD_REQUIRE_UPPER", tt.requireUpper)
			} else {
				os.Setenv("DATABAG_PASSWORD_REQUIRE_UPPER", "false")
			}
			if tt.requireLower != "" {
				os.Setenv("DATABAG_PASSWORD_REQUIRE_LOWER", tt.requireLower)
			} else {
				os.Setenv("DATABAG_PASSWORD_REQUIRE_LOWER", "false")
			}
			if tt.requireNumber != "" {
				os.Setenv("DATABAG_PASSWORD_REQUIRE_NUMBER", tt.requireNumber)
			} else {
				os.Setenv("DATABAG_PASSWORD_REQUIRE_NUMBER", "false")
			}
			if tt.requireSpecial != "" {
				os.Setenv("DATABAG_PASSWORD_REQUIRE_SPECIAL", tt.requireSpecial)
			} else {
				os.Setenv("DATABAG_PASSWORD_REQUIRE_SPECIAL", "false")
			}

			err := validatePasswordStrength(tt.password)

			if tt.expectError {
				if err == nil {
					t.Errorf("expected error but got none")
					return
				}
				if pwErr, ok := err.(*passwordError); ok && pwErr.Code != tt.errorCode {
					t.Errorf("expected error code %q, got %q", tt.errorCode, pwErr.Code)
				}
			} else {
				if err != nil {
					t.Errorf("unexpected error: %v", err)
				}
			}
		})
	}
}

func TestPasswordError(t *testing.T) {
	err := &passwordError{Code: "test_code", Message: "test message"}

	if err.Error() != "test message" {
		t.Errorf("Error() = %q, want %q", err.Error(), "test message")
	}

	if err.Code != "test_code" {
		t.Errorf("Code = %q, want %q", err.Code, "test_code")
	}
}
