package databag

import (
	"bytes"
	"errors"
	"io"
	"mime"
	"net/http"
	"strings"
)

var (
	ErrEmptyFile         = errors.New("empty file")
	ErrFileTooLarge      = errors.New("file too large")
	ErrInvalidFileType   = errors.New("invalid file type")
	ErrFileHeaderInvalid = errors.New("invalid file header")
)

type FileTypeConfig struct {
	AllowedMimeTypes []string
	MaxFileSize      int64
}

var DefaultFileConfig = FileTypeConfig{
	AllowedMimeTypes: []string{
		"image/jpeg",
		"image/png",
		"image/gif",
		"image/webp",
		"image/bmp",
		"video/mp4",
		"video/webm",
		"video/quicktime",
		"video/x-msvideo",
		"audio/mpeg",
		"audio/wav",
		"audio/ogg",
		"audio/aac",
		"application/pdf",
		"application/octet-stream",
	},
	MaxFileSize: 100 * 1024 * 1024,
}

func ValidateFileType(reader io.Reader, maxSize int64, allowedTypes []string) (string, []byte, error) {
	if len(allowedTypes) == 0 {
		allowedTypes = DefaultFileConfig.AllowedMimeTypes
	}
	if maxSize <= 0 {
		maxSize = DefaultFileConfig.MaxFileSize
	}

	buffer := make([]byte, 512)
	n, err := reader.Read(buffer)
	if err != nil && err != io.EOF {
		return "", nil, err
	}
	if n == 0 {
		return "", nil, ErrEmptyFile
	}

	buffer = buffer[:n]
	detectedType := http.DetectContentType(buffer)

	if !isAllowedType(detectedType, allowedTypes) {
		return "", nil, ErrInvalidFileType
	}

	return detectedType, buffer, nil
}

func ValidateFileExtension(filename string, allowedExtensions []string) bool {
	if len(allowedExtensions) == 0 {
		return true
	}

	ext := strings.ToLower(strings.TrimPrefix(getExtension(filename), "."))
	for _, allowed := range allowedExtensions {
		if strings.ToLower(allowed) == ext {
			return true
		}
	}
	return false
}

func isAllowedType(mimeType string, allowedTypes []string) bool {
	mimeType = strings.ToLower(strings.Split(mimeType, ";")[0])
	mimeType = strings.TrimSpace(mimeType)

	for _, allowed := range allowedTypes {
		allowed = strings.ToLower(strings.TrimSpace(allowed))
		if allowed == mimeType {
			return true
		}
		if allowed == "*/*" {
			return true
		}
		if strings.HasSuffix(allowed, "/*") {
			prefix := strings.TrimSuffix(allowed, "*")
			if strings.HasPrefix(mimeType, prefix) {
				return true
			}
		}
	}
	return false
}

func getExtension(filename string) string {
	if idx := strings.LastIndex(filename, "."); idx != -1 {
		return filename[idx:]
	}
	return ""
}

func DetectMimeType(data []byte) string {
	if len(data) == 0 {
		return ""
	}
	return http.DetectContentType(data)
}

func ParseMimeType(mimeType string) (string, string) {
	mimeType = strings.Split(mimeType, ";")[0]
	mimeType = strings.TrimSpace(mimeType)
	parts := strings.Split(mimeType, "/")
	if len(parts) == 2 {
		return parts[0], parts[1]
	}
	return mimeType, ""
}

type ValidatedFile struct {
	Reader     io.Reader
	Size       int64
	MimeType   string
	Extension  string
	FirstChunk []byte
}

func ValidateUpload(reader io.Reader, filename string, maxSize int64, allowedTypes []string) (*ValidatedFile, error) {
	mimeType, firstChunk, err := ValidateFileType(reader, maxSize, allowedTypes)
	if err != nil {
		return nil, err
	}

	ext := getExtension(filename)
	_, subType := ParseMimeType(mimeType)

	if ext == "" && subType != "" {
		ext = "." + subType
	}

	combinedReader := io.MultiReader(bytes.NewReader(firstChunk), reader)

	return &ValidatedFile{
		Reader:     combinedReader,
		MimeType:   mimeType,
		Extension:  ext,
		FirstChunk: firstChunk,
	}, nil
}

func GetMimeTypeFromExtension(ext string) string {
	ext = strings.TrimPrefix(ext, ".")
	mimeType := mime.TypeByExtension("." + ext)
	if mimeType == "" {
		return "application/octet-stream"
	}
	return mimeType
}

func IsImageMimeType(mimeType string) bool {
	mimeType = strings.ToLower(strings.Split(mimeType, ";")[0])
	return strings.HasPrefix(mimeType, "image/")
}

func IsVideoMimeType(mimeType string) bool {
	mimeType = strings.ToLower(strings.Split(mimeType, ";")[0])
	return strings.HasPrefix(mimeType, "video/")
}

func IsAudioMimeType(mimeType string) bool {
	mimeType = strings.ToLower(strings.Split(mimeType, ";")[0])
	return strings.HasPrefix(mimeType, "audio/")
}
