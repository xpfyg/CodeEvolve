package utils

import (
	"archive/zip"
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
	"unicode"

	"go.uber.org/zap"
	"codeevolve-backend/pkg/logger"
)

// GenerateID 生成唯一ID
func GenerateID() string {
	timestamp := time.Now().UnixNano()
	randomBytes := make([]byte, 8)
	rand.Read(randomBytes)

	return fmt.Sprintf("%x%x", timestamp, randomBytes)
}

// GenerateShortID 生成短ID (8位)
func GenerateShortID() string {
	randomBytes := make([]byte, 4)
	rand.Read(randomBytes)
	return hex.EncodeToString(randomBytes)
}

// ValidateEmail 验证邮箱格式
func ValidateEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// ValidateUsername 验证用户名格式
func ValidateUsername(username string) bool {
	if len(username) < 3 || len(username) > 20 {
		return false
	}

	usernameRegex := regexp.MustCompile(`^[a-zA-Z0-9_]+$`)
	return usernameRegex.MatchString(username)
}

// ValidatePassword 验证密码强度
func ValidatePassword(password string) (bool, string) {
	if len(password) < 6 {
		return false, "密码长度至少6位"
	}

	if len(password) > 50 {
		return false, "密码长度不能超过50位"
	}

	hasUpper := false
	hasLower := false
	hasDigit := false

	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsDigit(char):
			hasDigit = true
		}
	}

	score := 0
	if hasUpper {
		score++
	}
	if hasLower {
		score++
	}
	if hasDigit {
		score++
	}

	if score < 2 {
		return false, "密码必须包含大写字母、小写字母、数字中的至少两种"
	}

	return true, "密码强度合格"
}

// SanitizeFileName 清理文件名
func SanitizeFileName(filename string) string {
	// 移除危险字符
	filename = strings.ReplaceAll(filename, "..", "")
	filename = strings.ReplaceAll(filename, "/", "")
	filename = strings.ReplaceAll(filename, "\\", "")
	filename = strings.ReplaceAll(filename, ":", "")
	filename = strings.ReplaceAll(filename, "*", "")
	filename = strings.ReplaceAll(filename, "?", "")
	filename = strings.ReplaceAll(filename, "\"", "")
	filename = strings.ReplaceAll(filename, "<", "")
	filename = strings.ReplaceAll(filename, ">", "")
	filename = strings.ReplaceAll(filename, "|", "")

	// 限制长度
	if len(filename) > 255 {
		ext := filepath.Ext(filename)
		base := filename[:255-len(ext)]
		filename = base + ext
	}

	return filename
}

// GetFileExtension 获取文件扩展名
func GetFileExtension(filename string) string {
	return strings.ToLower(filepath.Ext(filename))
}

// IsAllowedFileType 检查文件类型是否允许
func IsAllowedFileType(filename string, allowedTypes []string) bool {
	ext := GetFileExtension(filename)
	for _, allowedType := range allowedTypes {
		if ext == allowedType {
			return true
		}
	}
	return false
}

// CalculateFileMD5 计算文件MD5哈希
func CalculateFileMD5(filepath string) (string, error) {
	file, err := os.Open(filepath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hash := md5.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	return hex.EncodeToString(hash.Sum(nil)), nil
}

// CreateZipArchive 创建ZIP压缩包
func CreateZipArchive(sourceDir, destFile string) error {
	zipFile, err := os.Create(destFile)
	if err != nil {
		return err
	}
	defer zipFile.Close()

	writer := zip.NewWriter(zipFile)
	defer writer.Close()

	return filepath.Walk(sourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() {
			return nil
		}

		relPath, err := filepath.Rel(sourceDir, path)
		if err != nil {
			return err
		}

		// 创建文件头
		header, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}
		header.Name = relPath
		header.Method = zip.Deflate

		// 创建文件写入器
		fileWriter, err := writer.CreateHeader(header)
		if err != nil {
			return err
		}

		// 读取源文件
		sourceFile, err := os.Open(path)
		if err != nil {
			return err
		}
		defer sourceFile.Close()

		// 复制文件内容
		_, err = io.Copy(fileWriter, sourceFile)
		return err
	})
}

// ExtractZipArchive 解压ZIP文件
func ExtractZipArchive(srcFile, destDir string) error {
	reader, err := zip.OpenReader(srcFile)
	if err != nil {
		return err
	}
	defer reader.Close()

	// 创建目标目录
	if err := os.MkdirAll(destDir, 0755); err != nil {
		return err
	}

	// 解压每个文件
	for _, file := range reader.File {
		destPath := filepath.Join(destDir, file.Name)

		// 安全检查：防止路径遍历攻击
		if !strings.HasPrefix(destPath, filepath.Clean(destDir)+string(os.PathSeparator)) {
			logger.Warn("Unsafe path in zip file", zap.String("path", file.Name))
			continue
		}

		if file.FileInfo().IsDir() {
			os.MkdirAll(destPath, file.FileInfo().Mode())
			continue
		}

		// 创建目录
		if err := os.MkdirAll(filepath.Dir(destPath), 0755); err != nil {
			return err
		}

		// 打开源文件
		srcFile, err := file.Open()
		if err != nil {
			return err
		}

		// 创建目标文件
		destFile, err := os.OpenFile(destPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, file.FileInfo().Mode())
		if err != nil {
			srcFile.Close()
			return err
		}

		// 复制文件内容
		_, err = io.Copy(destFile, srcFile)
		srcFile.Close()
		destFile.Close()

		if err != nil {
			return err
		}
	}

	return nil
}

// FormatFileSize 格式化文件大小
func FormatFileSize(size int64) string {
	const unit = 1024
	if size < unit {
		return fmt.Sprintf("%d B", size)
	}

	div, exp := int64(unit), 0
	for n := size / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}

	units := []string{"KB", "MB", "GB", "TB", "PB", "EB"}
	return fmt.Sprintf("%.1f %s", float64(size)/float64(div), units[exp])
}

// TruncateString 截断字符串
func TruncateString(str string, maxLen int) string {
	if len(str) <= maxLen {
		return str
	}

	if maxLen <= 3 {
		return str[:maxLen]
	}

	return str[:maxLen-3] + "..."
}

// RemoveEmptyStrings 移除切片中的空字符串
func RemoveEmptyStrings(slice []string) []string {
	var result []string
	for _, str := range slice {
		if strings.TrimSpace(str) != "" {
			result = append(result, str)
		}
	}
	return result
}

// UniqueStrings 去重字符串切片
func UniqueStrings(slice []string) []string {
	seen := make(map[string]bool)
	var result []string

	for _, str := range slice {
		if !seen[str] {
			seen[str] = true
			result = append(result, str)
		}
	}

	return result
}

// StringInSlice 检查字符串是否在切片中
func StringInSlice(str string, slice []string) bool {
	for _, s := range slice {
		if s == str {
			return true
		}
	}
	return false
}

// FormatDuration 格式化时间间隔
func FormatDuration(d time.Duration) string {
	if d < time.Minute {
		return fmt.Sprintf("%.1f秒", d.Seconds())
	}

	if d < time.Hour {
		return fmt.Sprintf("%.1f分钟", d.Minutes())
	}

	if d < 24*time.Hour {
		return fmt.Sprintf("%.1f小时", d.Hours())
	}

	return fmt.Sprintf("%.1f天", d.Hours()/24)
}

// ParsePageParams 解析分页参数
func ParsePageParams(pageStr, pageSizeStr string) (page, pageSize int) {
	page = 1
	pageSize = 20

	if pageStr != "" {
		if p, err := parsePositiveInt(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if pageSizeStr != "" {
		if ps, err := parsePositiveInt(pageSizeStr); err == nil && ps > 0 && ps <= 100 {
			pageSize = ps
		}
	}

	return page, pageSize
}

// parsePositiveInt 解析正整数
func parsePositiveInt(s string) (int, error) {
	if s == "" {
		return 0, fmt.Errorf("empty string")
	}

	result := 0
	for _, char := range s {
		if char < '0' || char > '9' {
			return 0, fmt.Errorf("invalid character: %c", char)
		}
		result = result*10 + int(char-'0')
		if result < 0 { // 溢出检查
			return 0, fmt.Errorf("integer overflow")
		}
	}

	return result, nil
}

// GenerateRandomCode 生成随机验证码
func GenerateRandomCode(length int) string {
	const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Int63()%int64(len(charset))]
	}
	return string(b)
}

// MaskEmail 掩码邮箱地址
func MaskEmail(email string) string {
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return email
	}

	username := parts[0]
	domain := parts[1]

	if len(username) <= 2 {
		return email
	}

	masked := username[:1] + strings.Repeat("*", len(username)-2) + username[len(username)-1:]
	return masked + "@" + domain
}

// MaskPhone 掩码手机号
func MaskPhone(phone string) string {
	if len(phone) <= 7 {
		return phone
	}

	return phone[:3] + strings.Repeat("*", len(phone)-7) + phone[len(phone)-4:]
}