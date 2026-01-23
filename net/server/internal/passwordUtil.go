package databag

import (
	"unicode"
)

func validatePasswordStrength(password string) error {
	minLength := getPasswordMinLength()
	maxLength := getPasswordMaxLength()
	requireUpper := getPasswordRequireUpper()
	requireLower := getPasswordRequireLower()
	requireNumber := getPasswordRequireNumber()
	requireSpecial := getPasswordRequireSpecial()

	if len(password) < minLength {
		return &passwordError{Code: "min_length", Message: "password too short"}
	}

	if len(password) > maxLength {
		return &passwordError{Code: "max_length", Message: "password too long"}
	}

	var hasUpper, hasLower, hasNumber, hasSpecial bool

	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsNumber(char):
			hasNumber = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSpecial = true
		}
	}

	if requireUpper && !hasUpper {
		return &passwordError{Code: "missing_upper", Message: "password must contain uppercase letters"}
	}

	if requireLower && !hasLower {
		return &passwordError{Code: "missing_lower", Message: "password must contain lowercase letters"}
	}

	if requireNumber && !hasNumber {
		return &passwordError{Code: "missing_number", Message: "password must contain numbers"}
	}

	if requireSpecial && !hasSpecial {
		return &passwordError{Code: "missing_special", Message: "password must contain special characters"}
	}

	return nil
}

type passwordError struct {
	Code    string
	Message string
}

func (e *passwordError) Error() string {
	return e.Message
}
