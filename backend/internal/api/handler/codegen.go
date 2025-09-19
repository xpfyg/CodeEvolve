package handler

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"codeevolve-backend/internal/service"
	"codeevolve-backend/pkg/logger"
)

type CodeGenHandler struct {
	codeGenSvc *service.CodeGenService
	aiSvc      *service.AIService
}

func NewCodeGenHandler(codeGenSvc *service.CodeGenService, aiSvc *service.AIService) *CodeGenHandler {
	return &CodeGenHandler{
		codeGenSvc: codeGenSvc,
		aiSvc:      aiSvc,
	}
}

// Generate 生成代码
// @Summary 生成代码
// @Description 基于模板生成项目代码
// @Tags 代码生成
// @Accept json
// @Produce json
// @Param request body service.GenerateRequest true "生成请求"
// @Success 200 {object} map[string]interface{} "success"
// @Router /api/v1/codegen/generate [post]
// @Security ApiKeyAuth
func (h *CodeGenHandler) Generate(c *gin.Context) {
	var req service.GenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Warn("Invalid generate request",
			zap.Error(err),
			zap.String("ip", c.ClientIP()),
		)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Invalid request body",
			"detail":  err.Error(),
		})
		return
	}

	// 获取当前用户ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "User ID not found",
		})
		return
	}

	logger.Info("Code generation request",
		zap.Uint("user_id", userID.(uint)),
		zap.Uint("template_id", req.TemplateID),
		zap.String("project_name", req.ProjectName),
	)

	// 执行代码生成
	task, err := h.codeGenSvc.GenerateCode(userID.(uint), &req)
	if err != nil {
		logger.Error("Code generation failed",
			zap.Error(err),
			zap.Uint("user_id", userID.(uint)),
			zap.Uint("template_id", req.TemplateID),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "generation_failed",
			"message": "Failed to generate code",
			"detail":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "Code generation started",
		"data": gin.H{
			"task": task,
		},
	})
}

// GetTask 获取代码生成任务
// @Summary 获取代码生成任务
// @Description 获取代码生成任务的详细信息和状态
// @Tags 代码生成
// @Accept json
// @Produce json
// @Param id path string true "任务ID"
// @Success 200 {object} map[string]interface{} "success"
// @Router /api/v1/codegen/tasks/{id} [get]
// @Security ApiKeyAuth
func (h *CodeGenHandler) GetTask(c *gin.Context) {
	taskID := c.Param("id")
	if taskID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_parameter",
			"message": "Task ID is required",
		})
		return
	}

	task, err := h.codeGenSvc.GetTask(taskID)
	if err != nil {
		logger.Error("Failed to get task",
			zap.Error(err),
			zap.String("task_id", taskID),
		)
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "not_found",
			"message": "Task not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"task": task,
		},
	})
}

// GetTasks 获取用户的代码生成任务列表
// @Summary 获取用户任务列表
// @Description 分页获取当前用户的代码生成任务列表
// @Tags 代码生成
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(20)
// @Success 200 {object} map[string]interface{} "success"
// @Router /api/v1/codegen/tasks [get]
// @Security ApiKeyAuth
func (h *CodeGenHandler) GetTasks(c *gin.Context) {
	// 获取当前用户ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "User ID not found",
		})
		return
	}

	// 获取分页参数
	page := getIntParam(c, "page", 1)
	pageSize := getIntParam(c, "page_size", 20)

	tasks, total, err := h.codeGenSvc.GetUserTasks(userID.(uint), page, pageSize)
	if err != nil {
		logger.Error("Failed to get user tasks",
			zap.Error(err),
			zap.Uint("user_id", userID.(uint)),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to get tasks",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"tasks":     tasks,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

// DeleteTask 删除代码生成任务
// @Summary 删除代码生成任务
// @Description 删除指定的代码生成任务
// @Tags 代码生成
// @Accept json
// @Produce json
// @Param id path string true "任务ID"
// @Success 200 {object} map[string]interface{} "success"
// @Router /api/v1/codegen/tasks/{id} [delete]
// @Security ApiKeyAuth
func (h *CodeGenHandler) DeleteTask(c *gin.Context) {
	taskID := c.Param("id")
	if taskID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_parameter",
			"message": "Task ID is required",
		})
		return
	}

	// 获取当前用户ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "User ID not found",
		})
		return
	}

	if err := h.codeGenSvc.DeleteTask(taskID, userID.(uint)); err != nil {
		if err.Error() == "permission denied" {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "forbidden",
				"message": "Permission denied",
			})
			return
		}

		logger.Error("Failed to delete task",
			zap.Error(err),
			zap.String("task_id", taskID),
			zap.Uint("user_id", userID.(uint)),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to delete task",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "Task deleted successfully",
	})
}

// DownloadResult 下载生成结果
// @Summary 下载生成结果
// @Description 下载代码生成任务的结果文件
// @Tags 代码生成
// @Accept json
// @Produce application/octet-stream
// @Param id path string true "任务ID"
// @Success 200 {file} file "下载文件"
// @Router /api/v1/codegen/tasks/{id}/download [get]
// @Security ApiKeyAuth
func (h *CodeGenHandler) DownloadResult(c *gin.Context) {
	taskID := c.Param("id")
	if taskID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_parameter",
			"message": "Task ID is required",
		})
		return
	}

	// 获取当前用户ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "User ID not found",
		})
		return
	}

	reader, filename, err := h.codeGenSvc.DownloadResult(taskID, userID.(uint))
	if err != nil {
		if err.Error() == "permission denied" {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "forbidden",
				"message": "Permission denied",
			})
			return
		}

		logger.Error("Failed to download result",
			zap.Error(err),
			zap.String("task_id", taskID),
			zap.Uint("user_id", userID.(uint)),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to download result",
		})
		return
	}

	// 设置下载头
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Header("Content-Type", "application/octet-stream")

	// 流式传输文件
	c.DataFromReader(http.StatusOK, -1, "application/octet-stream", reader, nil)
}

// AICustomizeRequest AI定制请求
type AICustomizeRequest struct {
	OriginalCode string                 `json:"original_code" binding:"required"`
	Requirement  string                 `json:"requirement" binding:"required"`
	Context      map[string]interface{} `json:"context"`
}

// AICustomize AI代码定制
// @Summary AI代码定制
// @Description 使用AI对代码进行智能定制
// @Tags 代码生成
// @Accept json
// @Produce json
// @Param request body AICustomizeRequest true "定制请求"
// @Success 200 {object} map[string]interface{} "success"
// @Router /api/v1/codegen/customize [post]
// @Security ApiKeyAuth
func (h *CodeGenHandler) AICustomize(c *gin.Context) {
	var req AICustomizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Warn("Invalid AI customize request",
			zap.Error(err),
			zap.String("ip", c.ClientIP()),
		)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Invalid request body",
			"detail":  err.Error(),
		})
		return
	}

	// 获取当前用户ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "User ID not found",
		})
		return
	}

	logger.Info("AI code customization request",
		zap.Uint("user_id", userID.(uint)),
		zap.String("requirement", req.Requirement[:min(len(req.Requirement), 100)]),
		zap.Int("code_length", len(req.OriginalCode)),
	)

	// 调用AI服务进行代码定制
	result, err := h.aiSvc.CustomizeCode(req.OriginalCode, req.Requirement, req.Context)
	if err != nil {
		logger.Error("AI code customization failed",
			zap.Error(err),
			zap.Uint("user_id", userID.(uint)),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "customization_failed",
			"message": "Failed to customize code",
			"detail":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "Code customization completed",
		"data":    result,
	})
}

// ParseRequirement 解析需求
// @Summary 解析用户需求
// @Description 使用AI解析用户的自然语言需求
// @Tags 代码生成
// @Accept json
// @Produce json
// @Param request body map[string]interface{} true "需求内容"
// @Success 200 {object} map[string]interface{} "success"
// @Router /api/v1/codegen/parse-requirement [post]
// @Security ApiKeyAuth
func (h *CodeGenHandler) ParseRequirement(c *gin.Context) {
	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Invalid request body",
		})
		return
	}

	requirement, ok := req["requirement"].(string)
	if !ok || requirement == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Requirement is required",
		})
		return
	}

	context, _ := req["context"].(map[string]interface{})

	// 调用AI服务解析需求
	result, err := h.aiSvc.ParseRequirement(requirement, context)
	if err != nil {
		logger.Error("Requirement parsing failed",
			zap.Error(err),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "parsing_failed",
			"message": "Failed to parse requirement",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "Requirement parsed successfully",
		"data":    result,
	})
}

// GetStats 获取代码生成统计信息
// @Summary 获取统计信息
// @Description 获取代码生成相关的统计信息
// @Tags 代码生成
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "success"
// @Router /api/v1/codegen/stats [get]
// @Security ApiKeyAuth
func (h *CodeGenHandler) GetStats(c *gin.Context) {
	stats, err := h.codeGenSvc.GetTaskStats()
	if err != nil {
		logger.Error("Failed to get stats",
			zap.Error(err),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to get statistics",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    stats,
	})
}

// getIntParam 获取整数参数
func getIntParam(c *gin.Context, key string, defaultValue int) int {
	if value, exists := c.GetQuery(key); exists {
		if intValue, err := parsePositiveInt(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// parsePositiveInt 解析正整数
func parsePositiveInt(s string) (int, error) {
	var result int
	for _, char := range s {
		if char < '0' || char > '9' {
			return 0, fmt.Errorf("invalid integer: %s", s)
		}
		result = result*10 + int(char-'0')
	}
	if result <= 0 {
		return 0, fmt.Errorf("must be positive: %s", s)
	}
	return result, nil
}

// min 返回两个整数的较小值
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}