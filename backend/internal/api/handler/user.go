package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"codeevolve-backend/internal/service"
)

type UserHandler struct {
	userSvc *service.UserService
}

func NewUserHandler(userSvc *service.UserService) *UserHandler {
	return &UserHandler{
		userSvc: userSvc,
	}
}

// LoginRequest 登录请求
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// RegisterRequest 注册请求
type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// Login 用户登录
// @Summary 用户登录
// @Description 用户登录认证
// @Tags 用户认证
// @Accept json
// @Produce json
// @Param login body LoginRequest true "登录信息"
// @Success 200 {object} map[string]interface{} "success"
// @Router /api/v1/auth/login [post]
func (h *UserHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Invalid request body",
			"detail":  err.Error(),
		})
		return
	}

	// 执行登录
	token, profile, err := h.userSvc.Login(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "login_failed",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "Login successful",
		"data": gin.H{
			"token":   token,
			"user":    profile,
		},
	})
}

// Register 用户注册
// @Summary 用户注册
// @Description 用户注册新账号
// @Tags 用户认证
// @Accept json
// @Produce json
// @Param register body RegisterRequest true "注册信息"
// @Success 201 {object} map[string]interface{} "success"
// @Router /api/v1/auth/register [post]
func (h *UserHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Invalid request body",
			"detail":  err.Error(),
		})
		return
	}

	// 执行注册
	user, err := h.userSvc.Register(req.Username, req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "register_failed",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"code":    0,
		"message": "Registration successful",
		"data": gin.H{
			"user": user.ToProfile(),
		},
	})
}

// GetProfile 获取用户资料
// @Summary 获取用户资料
// @Description 获取当前登录用户的详细信息
// @Tags 用户管理
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "success"
// @Router /api/v1/user/profile [get]
// @Security ApiKeyAuth
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "User ID not found",
		})
		return
	}

	profile, err := h.userSvc.GetProfile(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "internal_error",
			"message": "Failed to get user profile",
		})
		return
	}

	// 获取用户统计信息
	stats, _ := h.userSvc.GetUserStats(userID.(uint))

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"profile": profile,
			"stats":   stats,
		},
	})
}

// UpdateProfile 更新用户资料
// @Summary 更新用户资料
// @Description 更新当前用户的资料信息
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param profile body map[string]interface{} true "更新的用户信息"
// @Success 200 {object} map[string]interface{} "success"
// @Router /api/v1/user/profile [put]
// @Security ApiKeyAuth
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "User ID not found",
		})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Invalid request body",
		})
		return
	}

	// 更新用户资料
	if err := h.userSvc.UpdateProfile(userID.(uint), updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "update_failed",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "Profile updated successfully",
	})
}

// ChangePasswordRequest 修改密码请求
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

// ChangePassword 修改密码
// @Summary 修改密码
// @Description 修改当前用户密码
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param password body ChangePasswordRequest true "密码信息"
// @Success 200 {object} map[string]interface{} "success"
// @Router /api/v1/user/change-password [post]
// @Security ApiKeyAuth
func (h *UserHandler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "User ID not found",
		})
		return
	}

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Invalid request body",
		})
		return
	}

	// 修改密码
	if err := h.userSvc.ChangePassword(userID.(uint), req.OldPassword, req.NewPassword); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "change_password_failed",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "Password changed successfully",
	})
}

// Logout 用户登出
// @Summary 用户登出
// @Description 用户登出，清除登录状态
// @Tags 用户认证
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "success"
// @Router /api/v1/user/logout [post]
// @Security ApiKeyAuth
func (h *UserHandler) Logout(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "User ID not found",
		})
		return
	}

	// 执行登出
	if err := h.userSvc.Logout(userID.(uint)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "logout_failed",
			"message": "Failed to logout",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "Logout successful",
	})
}