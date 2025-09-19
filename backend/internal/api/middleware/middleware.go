package middleware

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"golang.org/x/time/rate"

	"codeevolve-backend/pkg/logger"
)

// RateLimiter 速率限制中间件
type RateLimiter struct {
	limiter *rate.Limiter
	burst   int
	rate    float64
}

// NewRateLimiter 创建新的速率限制器
func NewRateLimiter(r float64, b int) *RateLimiter {
	return &RateLimiter{
		limiter: rate.NewLimiter(rate.Limit(r), b),
		burst:   b,
		rate:    r,
	}
}

// Middleware 返回速率限制中间件
func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !rl.limiter.Allow() {
			logger.Warn("Rate limit exceeded",
				zap.String("ip", c.ClientIP()),
				zap.String("path", c.Request.URL.Path),
				zap.String("method", c.Request.Method),
				zap.Float64("rate", rl.rate),
				zap.Int("burst", rl.burst),
			)

			c.JSON(429, gin.H{
				"error":   "rate_limit_exceeded",
				"message": "Too many requests",
				"retry_after": fmt.Sprintf("%.0f", 1.0/rl.rate),
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// RequestTimeout 请求超时中间件
func RequestTimeout(timeout time.Duration) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// 创建带超时的context
		ctx, cancel := c.Request.Context(), func() {}
		if timeout > 0 {
			ctx, cancel = c.Request.Context(), cancel
		}
		defer cancel()

		// 设置超时context
		c.Request = c.Request.WithContext(ctx)

		// 创建完成通道
		finished := make(chan struct{})
		go func() {
			defer func() {
				if err := recover(); err != nil {
					logger.Error("Request panic",
						zap.Any("error", err),
						zap.String("path", c.Request.URL.Path),
						zap.String("method", c.Request.Method),
					)
				}
				close(finished)
			}()
			c.Next()
		}()

		select {
		case <-finished:
			// 请求正常完成
		case <-time.After(timeout):
			// 请求超时
			logger.Warn("Request timeout",
				zap.String("path", c.Request.URL.Path),
				zap.String("method", c.Request.Method),
				zap.Duration("timeout", timeout),
				zap.String("ip", c.ClientIP()),
			)

			if !c.Writer.Written() {
				c.JSON(408, gin.H{
					"error":   "request_timeout",
					"message": "Request timeout",
					"timeout": timeout.String(),
				})
			}
			c.Abort()
		}
	})
}

// SecurityHeaders 安全头中间件
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 设置安全头
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		c.Header("Content-Security-Policy", "default-src 'self'")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		// 移除可能暴露服务器信息的头
		c.Header("Server", "")

		c.Next()
	}
}

// APIVersionMiddleware API版本中间件
func APIVersionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从头部获取API版本
		version := c.GetHeader("API-Version")
		if version == "" {
			version = "v1" // 默认版本
		}

		// 验证版本格式
		supportedVersions := []string{"v1", "v2"}
		isSupported := false
		for _, v := range supportedVersions {
			if version == v {
				isSupported = true
				break
			}
		}

		if !isSupported {
			logger.Warn("Unsupported API version requested",
				zap.String("version", version),
				zap.String("path", c.Request.URL.Path),
				zap.String("ip", c.ClientIP()),
			)

			c.JSON(400, gin.H{
				"error":   "unsupported_version",
				"message": "Unsupported API version",
				"supported_versions": supportedVersions,
			})
			c.Abort()
			return
		}

		// 设置版本到context
		c.Set("api_version", version)
		c.Header("API-Version", version)

		c.Next()
	}
}

// RequestID 生成请求ID中间件
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取或生成请求ID
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = generateRequestID()
		}

		// 设置到context和响应头
		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)

		// 添加到日志字段
		logger.Info("Request started",
			zap.String("request_id", requestID),
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
		)

		c.Next()
	}
}

// generateRequestID 生成唯一的请求ID
func generateRequestID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

// MetricsMiddleware 监控指标中间件
func MetricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		c.Next()

		// 记录指标
		duration := time.Since(start)
		status := c.Writer.Status()

		logger.Info("Request metrics",
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.Int("status", status),
			zap.Duration("duration", duration),
			zap.Int("response_size", c.Writer.Size()),
		)

		// 这里可以集成Prometheus等监控系统
		// prometheus.RecordHTTPRequest(c.Request.Method, c.Request.URL.Path, status, duration)
	}
}