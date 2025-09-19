package logger

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"github.com/spf13/viper"
)

var Logger *zap.Logger

// InitLogger 初始化日志配置
func InitLogger() *zap.Logger {
	// 获取配置
	logLevel := viper.GetString("log.level")
	logFormat := viper.GetString("log.format")
	logOutput := viper.GetString("log.output")

	// 设置日志级别
	var level zapcore.Level
	switch logLevel {
	case "debug":
		level = zap.DebugLevel
	case "info":
		level = zap.InfoLevel
	case "warn":
		level = zap.WarnLevel
	case "error":
		level = zap.ErrorLevel
	case "panic":
		level = zap.PanicLevel
	case "fatal":
		level = zap.FatalLevel
	default:
		level = zap.InfoLevel
	}

	// 创建编码器配置
	var encoderConfig zapcore.EncoderConfig
	if logFormat == "json" {
		encoderConfig = zap.NewProductionEncoderConfig()
	} else {
		encoderConfig = zap.NewDevelopmentEncoderConfig()
	}

	// 自定义时间格式
	encoderConfig.TimeKey = "timestamp"
	encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder

	// 创建编码器
	var encoder zapcore.Encoder
	if logFormat == "json" {
		encoder = zapcore.NewJSONEncoder(encoderConfig)
	} else {
		encoder = zapcore.NewConsoleEncoder(encoderConfig)
	}

	// 设置输出
	var writeSyncer zapcore.WriteSyncer
	if logOutput == "stdout" {
		writeSyncer = zapcore.AddSync(os.Stdout)
	} else {
		// 这里可以扩展为文件输出
		writeSyncer = zapcore.AddSync(os.Stdout)
	}

	// 创建核心
	core := zapcore.NewCore(encoder, writeSyncer, level)

	// 创建logger
	Logger = zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))

	return Logger
}

// GetLogger 获取全局logger实例
func GetLogger() *zap.Logger {
	if Logger == nil {
		return InitLogger()
	}
	return Logger
}

// Debug 记录debug级别日志
func Debug(msg string, fields ...zap.Field) {
	GetLogger().Debug(msg, fields...)
}

// Info 记录info级别日志
func Info(msg string, fields ...zap.Field) {
	GetLogger().Info(msg, fields...)
}

// Warn 记录warn级别日志
func Warn(msg string, fields ...zap.Field) {
	GetLogger().Warn(msg, fields...)
}

// Error 记录error级别日志
func Error(msg string, fields ...zap.Field) {
	GetLogger().Error(msg, fields...)
}

// Fatal 记录fatal级别日志
func Fatal(msg string, fields ...zap.Field) {
	GetLogger().Fatal(msg, fields...)
}

// Panic 记录panic级别日志
func Panic(msg string, fields ...zap.Field) {
	GetLogger().Panic(msg, fields...)
}

// Sync 同步日志缓冲区
func Sync() error {
	if Logger != nil {
		return Logger.Sync()
	}
	return nil
}