package utils

import (
	"errors"
	"regexp"
	"strings"
)

// CodeValidator 代码验证器
type CodeValidator struct {
	allowedExtensions []string
	maxFileSize       int64
}

// NewCodeValidator 创建代码验证器
func NewCodeValidator() *CodeValidator {
	return &CodeValidator{
		allowedExtensions: []string{
			".go", ".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".cpp", ".c", ".h",
			".php", ".rb", ".rs", ".swift", ".kt", ".scala", ".sql", ".html", ".css",
			".scss", ".less", ".json", ".xml", ".yaml", ".yml", ".md", ".txt",
		},
		maxFileSize: 10 * 1024 * 1024, // 10MB
	}
}

// ValidateCodeFile 验证代码文件
func (cv *CodeValidator) ValidateCodeFile(filename string, content []byte) error {
	// 检查文件扩展名
	if !cv.isAllowedExtension(filename) {
		return errors.New("unsupported file type")
	}

	// 检查文件大小
	if int64(len(content)) > cv.maxFileSize {
		return errors.New("file size exceeds limit")
	}

	// 检查是否包含恶意代码
	if cv.containsMaliciousCode(string(content)) {
		return errors.New("file contains potentially malicious code")
	}

	return nil
}

// isAllowedExtension 检查文件扩展名
func (cv *CodeValidator) isAllowedExtension(filename string) bool {
	ext := GetFileExtension(filename)
	return StringInSlice(ext, cv.allowedExtensions)
}

// containsMaliciousCode 检查是否包含恶意代码
func (cv *CodeValidator) containsMaliciousCode(content string) bool {
	// 恶意代码模式
	maliciousPatterns := []string{
		`eval\s*\(`,                    // eval函数
		`exec\s*\(`,                    // exec函数
		`system\s*\(`,                  // system函数
		`shell_exec\s*\(`,              // shell_exec函数
		`passthru\s*\(`,                // passthru函数
		`file_get_contents\s*\(.*http`, // 远程文件读取
		`curl_exec\s*\(`,               // curl执行
		`fopen\s*\(.*\/\/`,             // 远程文件打开
		`include\s*\(.*http`,           // 远程包含
		`require\s*\(.*http`,           // 远程包含
		`<script[^>]*>.*<\/script>`,    // script标签
		`javascript:`,                   // javascript协议
		`vbscript:`,                     // vbscript协议
		`onload\s*=`,                    // onload事件
		`onclick\s*=`,                   // onclick事件
		`onerror\s*=`,                   // onerror事件
	}

	contentLower := strings.ToLower(content)

	for _, pattern := range maliciousPatterns {
		matched, _ := regexp.MatchString(pattern, contentLower)
		if matched {
			return true
		}
	}

	return false
}

// SanitizeCode 清理代码内容
func (cv *CodeValidator) SanitizeCode(content string) string {
	// 移除潜在的危险注释
	content = cv.removeDangerousComments(content)

	// 规范化换行符
	content = strings.ReplaceAll(content, "\r\n", "\n")
	content = strings.ReplaceAll(content, "\r", "\n")

	return content
}

// removeDangerousComments 移除危险注释
func (cv *CodeValidator) removeDangerousComments(content string) string {
	// 移除可能包含恶意代码的注释
	dangerousCommentPatterns := []string{
		`//.*eval\(`,
		`//.*exec\(`,
		`//.*system\(`,
		`/\*.*eval\(.*\*/`,
		`/\*.*exec\(.*\*/`,
		`/\*.*system\(.*\*/`,
	}

	for _, pattern := range dangerousCommentPatterns {
		re := regexp.MustCompile(pattern)
		content = re.ReplaceAllString(content, "")
	}

	return content
}

// ValidateProjectStructure 验证项目结构
func ValidateProjectStructure(files map[string][]byte) error {
	// 检查文件数量限制
	if len(files) > 1000 {
		return errors.New("too many files in project")
	}

	// 检查是否有核心文件
	hasMainFile := false
	coreFiles := []string{"main.go", "index.js", "App.js", "main.py", "index.html"}

	for filename := range files {
		for _, coreFile := range coreFiles {
			if strings.HasSuffix(filename, coreFile) {
				hasMainFile = true
				break
			}
		}
		if hasMainFile {
			break
		}
	}

	if !hasMainFile {
		return errors.New("project missing main entry file")
	}

	// 验证每个文件
	validator := NewCodeValidator()
	for filename, content := range files {
		if err := validator.ValidateCodeFile(filename, content); err != nil {
			return err
		}
	}

	return nil
}

// ExtractCodeLanguage 提取代码语言
func ExtractCodeLanguage(filename string) string {
	ext := GetFileExtension(filename)

	languageMap := map[string]string{
		".go":   "golang",
		".js":   "javascript",
		".ts":   "typescript",
		".jsx":  "javascript",
		".tsx":  "typescript",
		".py":   "python",
		".java": "java",
		".cpp":  "cpp",
		".c":    "c",
		".h":    "c",
		".php":  "php",
		".rb":   "ruby",
		".rs":   "rust",
		".swift": "swift",
		".kt":   "kotlin",
		".scala": "scala",
		".sql":  "sql",
		".html": "html",
		".css":  "css",
		".scss": "scss",
		".less": "less",
		".json": "json",
		".xml":  "xml",
		".yaml": "yaml",
		".yml":  "yaml",
		".md":   "markdown",
	}

	if lang, exists := languageMap[ext]; exists {
		return lang
	}

	return "text"
}

// FormatCode 格式化代码
func FormatCode(content, language string) string {
	switch language {
	case "json":
		return formatJSON(content)
	case "xml":
		return formatXML(content)
	default:
		return content
	}
}

// formatJSON 格式化JSON
func formatJSON(content string) string {
	// 简单的JSON格式化（生产环境建议使用专业库）
	content = strings.ReplaceAll(content, ",", ",\n")
	content = strings.ReplaceAll(content, "{", "{\n")
	content = strings.ReplaceAll(content, "}", "\n}")
	content = strings.ReplaceAll(content, "[", "[\n")
	content = strings.ReplaceAll(content, "]", "\n]")
	return content
}

// formatXML 格式化XML
func formatXML(content string) string {
	// 简单的XML格式化
	content = strings.ReplaceAll(content, "><", ">\n<")
	return content
}