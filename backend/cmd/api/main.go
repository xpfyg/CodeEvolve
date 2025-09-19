package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"go.uber.org/zap"

	"codeevolve-backend/internal/api/handler"
	"codeevolve-backend/internal/api/middleware"
	"codeevolve-backend/internal/model"
	"codeevolve-backend/internal/repo"
	"codeevolve-backend/internal/service"
	"codeevolve-backend/pkg/logger"
)

// @title CodeEvolve API
// @version 1.0
// @description CodeEvolve智能代码生成平台后端API
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /api/v1

// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization

func main() {
	// 初始化配置
	initConfig()

	// 初始化日志
	logger := logger.InitLogger()
	defer logger.Sync()

	// 初始化数据库
	db, err := model.InitDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// 初始化存储
	minioClient, err := repo.InitMinio()
	if err != nil {
		log.Fatal("Failed to connect to MinIO:", err)
	}

	redisClient, err := repo.InitRedis()
	if err != nil {
		log.Fatal("Failed to connect to Redis:", err)
	}

	// 初始化仓库层
	templateRepo := repo.NewTemplateRepo(db, minioClient)
	userRepo := repo.NewUserRepo(db, redisClient)
	codeGenRepo := repo.NewCodeGenRepo(db, minioClient)

	// 初始化服务层
	templateSvc := service.NewTemplateService(templateRepo)
	userSvc := service.NewUserService(userRepo)
	codeGenSvc := service.NewCodeGenService(codeGenRepo)
	aiSvc := service.NewAIService()

	// 初始化处理器
	templateHandler := handler.NewTemplateHandler(templateSvc)
	userHandler := handler.NewUserHandler(userSvc)
	codeGenHandler := handler.NewCodeGenHandler(codeGenSvc, aiSvc)

	// 初始化Gin引擎
	if gin.Mode() == gin.ReleaseMode {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()

	// 全局中间件
	r.Use(middleware.RequestID())
	r.Use(middleware.RequestLogger())
	r.Use(middleware.ErrorLogger())
	r.Use(middleware.CORS())
	r.Use(middleware.SecurityHeaders())
	r.Use(middleware.RequestTimeout(30 * time.Second))

	// 速率限制 (每秒10个请求，突发20个)
	rateLimiter := middleware.NewRateLimiter(10.0, 20)
	r.Use(rateLimiter.Middleware())

	// Swagger文档
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// API路由
	v1 := r.Group("/api/v1")
	{
		// 用户相关
		auth := v1.Group("/auth")
		{
			auth.POST("/login", userHandler.Login)
			auth.POST("/register", userHandler.Register)
		}

		// 需要认证的路由
		authorized := v1.Group("/")
		authorized.Use(middleware.JWTAuth())
		authorized.Use(middleware.AuditLogger()) // 审计日志
		{
			// 模板管理
			templates := authorized.Group("/templates")
			{
				templates.GET("", templateHandler.List)
				templates.GET("/:id", templateHandler.GetByID)
				templates.POST("", templateHandler.Create)
				templates.PUT("/:id", templateHandler.Update)
				templates.DELETE("/:id", templateHandler.Delete)
				templates.POST("/:id/upload", templateHandler.UploadFile)
			}

			// 代码生成
			codegen := authorized.Group("/codegen")
			{
				codegen.POST("/generate", codeGenHandler.Generate)
				codegen.GET("/tasks", codeGenHandler.GetTasks)
				codegen.GET("/tasks/:id", codeGenHandler.GetTask)
				codegen.DELETE("/tasks/:id", codeGenHandler.DeleteTask)
				codegen.GET("/tasks/:id/download", codeGenHandler.DownloadResult)
				codegen.POST("/customize", codeGenHandler.AICustomize)
				codegen.POST("/parse-requirement", codeGenHandler.ParseRequirement)
				codegen.GET("/stats", codeGenHandler.GetStats)
			}

			// 用户信息
			user := authorized.Group("/user")
			{
				user.GET("/profile", userHandler.GetProfile)
				user.PUT("/profile", userHandler.UpdateProfile)
				user.POST("/logout", userHandler.Logout)
			}
		}
	}

	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"message": "CodeEvolve API is running",
		})
	})

	port := viper.GetString("server.port")
	if port == "" {
		port = "8080"
	}

	logger.Info("Starting CodeEvolve API server", zap.String("port", port))
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func initConfig() {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./configs")
	viper.AddConfigPath(".")

	// 设置默认值
	viper.SetDefault("server.port", "8080")
	viper.SetDefault("database.host", "localhost")
	viper.SetDefault("database.port", 3306)
	viper.SetDefault("database.username", "codeevolve")
	viper.SetDefault("database.password", "codeevolve123")
	viper.SetDefault("database.dbname", "codeevolve")

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			log.Println("Config file not found, using defaults")
		} else {
			log.Fatal("Error reading config file:", err)
		}
	}

	// 环境变量覆盖
	viper.AutomaticEnv()
}