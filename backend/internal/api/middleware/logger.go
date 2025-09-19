package middleware

import (
	"bytes"
	"io"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"codeevolve-backend/pkg/logger"
)

// RequestLogger 请求日志中间件
func RequestLogger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		// 使用zap记录结构化日志
		logger.Info("HTTP Request",
			zap.String("method", param.Method),
			zap.String("path", param.Path),
			zap.String("query", param.Request.URL.RawQuery),
			zap.String("ip", param.ClientIP),
			zap.String("user_agent", param.Request.UserAgent()),
			zap.Int("status", param.StatusCode),
			zap.Duration("latency", param.Latency),
			zap.String("error", param.ErrorMessage),
		)
		return ""
	})
}

// ErrorLogger 错误日志中间件
func ErrorLogger() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		if err, ok := recovered.(string); ok {
			logger.Error("Panic recovered",
				zap.String("error", err),
				zap.String("path", c.Request.URL.Path),
				zap.String("method", c.Request.Method),
				zap.String("ip", c.ClientIP()),
			)
		}
		c.AbortWithStatus(500)
	})
}

// DetailedLogger 详细日志中间件（包含请求体和响应体）
func DetailedLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 记录请求开始时间
		start := time.Now()

		// 读取请求体
		var requestBody []byte
		if c.Request.Body != nil && c.Request.ContentLength > 0 && c.Request.ContentLength < 1024*1024 { // 限制1MB
			requestBody, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))
		}

		// 创建响应写入器来捕获响应体
		blw := &bodyLogWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
		c.Writer = blw

		// 处理请求
		c.Next()

		// 计算延迟
		latency := time.Since(start)

		// 记录详细日志
		fields := []zap.Field{
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.String("query", c.Request.URL.RawQuery),
			zap.String("ip", c.ClientIP()),
			zap.String("user_agent", c.Request.UserAgent()),
			zap.Int("status", c.Writer.Status()),
			zap.Duration("latency", latency),
			zap.Int("response_size", blw.body.Len()),
		}

		// 添加请求体（如果存在且不是文件上传）
		if len(requestBody) > 0 && !isFileUpload(c.GetHeader("Content-Type")) {
			fields = append(fields, zap.String("request_body", string(requestBody)))
		}

		// 添加响应体（如果是JSON且大小合理）
		if isJSONResponse(c.GetHeader("Content-Type")) && blw.body.Len() < 10240 { // 限制10KB
			fields = append(fields, zap.String("response_body", blw.body.String()))
		}

		// 记录用户信息（如果有）
		if userID, exists := c.Get("user_id"); exists {
			fields = append(fields, zap.Uint("user_id", userID.(uint)))
		}
		if username, exists := c.Get("username"); exists {
			fields = append(fields, zap.String("username", username.(string)))
		}

		// 记录错误信息（如果有）
		if len(c.Errors) > 0 {
			fields = append(fields, zap.String("errors", c.Errors.String()))
		}

		// 根据状态码选择日志级别
		if c.Writer.Status() >= 500 {
			logger.Error("HTTP Request", fields...)
		} else if c.Writer.Status() >= 400 {
			logger.Warn("HTTP Request", fields...)
		} else {
			logger.Info("HTTP Request", fields...)
		}
	}
}

// bodyLogWriter 用于捕获响应体的写入器
type bodyLogWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w bodyLogWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

// isFileUpload 检查是否为文件上传
func isFileUpload(contentType string) bool {
	return contentType == "multipart/form-data" ||
		   contentType == "application/octet-stream"
}

// isJSONResponse 检查是否为JSON响应
func isJSONResponse(contentType string) bool {
	return contentType == "application/json" ||
		   contentType == "application/json; charset=utf-8"
}

// AuditLogger 审计日志中间件（用于敏感操作）
func AuditLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 只记录特定的敏感操作
		if isAuditableOperation(c.Request.Method, c.Request.URL.Path) {
			start := time.Now()

			// 记录操作开始
			logger.Info("Audit Log - Operation Start",
				zap.String("operation", c.Request.Method+" "+c.Request.URL.Path),
				zap.String("ip", c.ClientIP()),
				zap.String("user_agent", c.Request.UserAgent()),
				zap.Time("timestamp", start),
			)

			c.Next()

			// 记录操作结果
			fields := []zap.Field{
				zap.String("operation", c.Request.Method+" "+c.Request.URL.Path),
				zap.String("ip", c.ClientIP()),
				zap.Int("status", c.Writer.Status()),
				zap.Duration("duration", time.Since(start)),
				zap.Time("timestamp", time.Now()),
			}

			if userID, exists := c.Get("user_id"); exists {
				fields = append(fields, zap.Uint("user_id", userID.(uint)))
			}
			if username, exists := c.Get("username"); exists {
				fields = append(fields, zap.String("username", username.(string)))
			}

			if c.Writer.Status() >= 400 {
				logger.Warn("Audit Log - Operation Failed", fields...)
			} else {
				logger.Info("Audit Log - Operation Success", fields...)
			}
		} else {
			c.Next()
		}
	}
}

// isAuditableOperation 判断是否为需要审计的操作
func isAuditableOperation(method, path string) bool {
	auditPaths := []string{
		"/api/v1/auth/login",
		"/api/v1/auth/register",
		"/api/v1/templates",
		"/api/v1/codegen",
		"/api/v1/user/change-password",
	}

	auditMethods := []string{"POST", "PUT", "DELETE"}

	// 检查方法
	for _, m := range auditMethods {
		if method == m {
			// 检查路径
			for _, p := range auditPaths {
				if path == p || (len(path) > len(p) && path[:len(p)] == p) {
					return true
				}
			}
		}
	}

	return false
}