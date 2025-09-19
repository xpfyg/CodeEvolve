package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"codeevolve-backend/internal/model"
	"codeevolve-backend/internal/service"
)

type TemplateHandler struct {
	templateSvc *service.TemplateService
}

func NewTemplateHandler(templateSvc *service.TemplateService) *TemplateHandler {
	return &TemplateHandler{
		templateSvc: templateSvc,
	}
}

// List 获取模板列表
// @Summary 获取模板列表
// @Description 分页获取模板列表，支持按分类筛选
// @Tags 模板管理
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(20)
// @Param category query string false "分类"
// @Success 200 {object} map[string]interface{} "success"
// @Router /api/v1/templates [get]
// @Security ApiKeyAuth
func (h *TemplateHandler) List(c *gin.Context) {
	// 获取查询参数
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	category := c.Query("category")

	// 调用服务获取模板列表
	templates, total, err := h.templateSvc.GetTemplates(page, pageSize, category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to get templates",
			"detail":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"templates": templates,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

// GetByID 获取单个模板
// @Summary 获取模板详情
// @Description 根据ID获取模板详细信息
// @Tags 模板管理
// @Accept json
// @Produce json
// @Param id path int true "模板ID"
// @Success 200 {object} map[string]interface{} "success"
// @Router /api/v1/templates/{id} [get]
// @Security ApiKeyAuth
func (h *TemplateHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_parameter",
			"message": "Invalid template ID",
		})
		return
	}

	template, err := h.templateSvc.GetTemplate(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "not_found",
			"message": "Template not found",
		})
		return
	}

	// 获取模板配置
	configs, err := h.templateSvc.GetTemplateConfigs(uint(id))
	if err != nil {
		// 配置获取失败不影响模板返回
		configs = []*model.TemplateConfig{}
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"template": template,
			"configs":  configs,
		},
	})
}

// Create 创建模板
// @Summary 创建新模板
// @Description 创建新的代码模板
// @Tags 模板管理
// @Accept json
// @Produce json
// @Param template body model.Template true "模板信息"
// @Success 201 {object} map[string]interface{} "success"
// @Router /api/v1/templates [post]
// @Security ApiKeyAuth
func (h *TemplateHandler) Create(c *gin.Context) {
	var template model.Template
	if err := c.ShouldBindJSON(&template); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Invalid request body",
			"detail":  err.Error(),
		})
		return
	}

	// 设置创建者ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "User ID not found",
		})
		return
	}
	template.CreatedBy = userID.(uint)

	// 创建模板
	if err := h.templateSvc.CreateTemplate(&template); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to create template",
			"detail":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"code":    0,
		"message": "Template created successfully",
		"data": gin.H{
			"template": template,
		},
	})
}

// Update 更新模板
// @Summary 更新模板
// @Description 更新现有模板信息
// @Tags 模板管理
// @Accept json
// @Produce json
// @Param id path int true "模板ID"
// @Param template body model.Template true "更新的模板信息"
// @Success 200 {object} map[string]interface{} "success"
// @Router /api/v1/templates/{id} [put]
// @Security ApiKeyAuth
func (h *TemplateHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_parameter",
			"message": "Invalid template ID",
		})
		return
	}

	var updates model.Template
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Invalid request body",
			"detail":  err.Error(),
		})
		return
	}

	// 更新模板
	if err := h.templateSvc.UpdateTemplate(uint(id), &updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to update template",
			"detail":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "Template updated successfully",
	})
}

// Delete 删除模板
// @Summary 删除模板
// @Description 删除指定的模板
// @Tags 模板管理
// @Accept json
// @Produce json
// @Param id path int true "模板ID"
// @Success 200 {object} map[string]interface{} "success"
// @Router /api/v1/templates/{id} [delete]
// @Security ApiKeyAuth
func (h *TemplateHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_parameter",
			"message": "Invalid template ID",
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

	// 删除模板
	if err := h.templateSvc.DeleteTemplate(uint(id), userID.(uint)); err != nil {
		if err.Error() == "permission denied" {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "forbidden",
				"message": "Permission denied",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to delete template",
			"detail":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "Template deleted successfully",
	})
}

// UploadFile 上传模板文件
// @Summary 上传模板文件
// @Description 上传模板的代码文件
// @Tags 模板管理
// @Accept multipart/form-data
// @Produce json
// @Param id path int true "模板ID"
// @Param file formData file true "模板文件"
// @Success 200 {object} map[string]interface{} "success"
// @Router /api/v1/templates/{id}/upload [post]
// @Security ApiKeyAuth
func (h *TemplateHandler) UploadFile(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_parameter",
			"message": "Invalid template ID",
		})
		return
	}

	// 获取上传的文件
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "No file uploaded",
		})
		return
	}

	// 检查文件大小（限制为50MB）
	if file.Size > 50*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "file_too_large",
			"message": "File size exceeds 50MB limit",
		})
		return
	}

	// 打开文件
	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to open uploaded file",
		})
		return
	}
	defer src.Close()

	// 实现文件上传到MinIO的逻辑
	fileURL, err := h.templateSvc.UploadFile(uint(id), file.Filename, src)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "upload_failed",
			"message": "Failed to upload file",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "File uploaded successfully",
		"data": gin.H{
			"filename": file.Filename,
			"size":     file.Size,
			"url":      fileURL,
		},
	})
}