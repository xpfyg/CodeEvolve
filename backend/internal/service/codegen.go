package service

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"codeevolve-backend/internal/model"
	"codeevolve-backend/internal/repo"
	"codeevolve-backend/pkg/logger"
)

type CodeGenService struct {
	codeGenRepo  *repo.CodeGenRepo
	templateRepo *repo.TemplateRepo
}

func NewCodeGenService(codeGenRepo *repo.CodeGenRepo) *CodeGenService {
	return &CodeGenService{
		codeGenRepo: codeGenRepo,
	}
}

// GenerateRequest 代码生成请求
type GenerateRequest struct {
	TemplateID  uint                   `json:"template_id" binding:"required"`
	ProjectName string                 `json:"project_name" binding:"required"`
	Description string                 `json:"description"`
	Config      map[string]interface{} `json:"config"`
}

// GenerateCode 生成代码
func (s *CodeGenService) GenerateCode(userID uint, req *GenerateRequest) (*model.CodeGenTask, error) {
	logger.Info("Starting code generation",
		zap.Uint("user_id", userID),
		zap.Uint("template_id", req.TemplateID),
		zap.String("project_name", req.ProjectName),
	)

	// 验证输入参数
	if req.TemplateID == 0 {
		return nil, errors.New("template ID is required")
	}
	if req.ProjectName == "" {
		return nil, errors.New("project name is required")
	}

	// 生成任务ID
	taskID := generateTaskID()

	// 创建代码生成任务
	task := &model.CodeGenTask{
		TaskID:      taskID,
		UserID:      userID,
		TemplateID:  req.TemplateID,
		ProjectName: req.ProjectName,
		Description: req.Description,
		Config:      req.Config,
		Status:      model.TaskStatusPending,
		Progress:    0,
	}

	// 保存任务到数据库
	if err := s.codeGenRepo.CreateTask(task); err != nil {
		logger.Error("Failed to create code generation task",
			zap.Error(err),
			zap.String("task_id", taskID),
		)
		return nil, fmt.Errorf("failed to create task: %w", err)
	}

	// 异步执行代码生成
	go s.executeCodeGeneration(task)

	logger.Info("Code generation task created",
		zap.String("task_id", taskID),
		zap.Uint("user_id", userID),
	)

	return task, nil
}

// GetTask 获取代码生成任务
func (s *CodeGenService) GetTask(taskID string) (*model.CodeGenTask, error) {
	if taskID == "" {
		return nil, errors.New("task ID is required")
	}

	task, err := s.codeGenRepo.GetTask(taskID)
	if err != nil {
		logger.Error("Failed to get code generation task",
			zap.Error(err),
			zap.String("task_id", taskID),
		)
		return nil, fmt.Errorf("failed to get task: %w", err)
	}

	return task, nil
}

// GetUserTasks 获取用户的代码生成任务列表
func (s *CodeGenService) GetUserTasks(userID uint, page, pageSize int) ([]*model.CodeGenTask, int64, error) {
	if userID == 0 {
		return nil, 0, errors.New("user ID is required")
	}

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	tasks, total, err := s.codeGenRepo.GetUserTasks(userID, page, pageSize)
	if err != nil {
		logger.Error("Failed to get user tasks",
			zap.Error(err),
			zap.Uint("user_id", userID),
		)
		return nil, 0, fmt.Errorf("failed to get user tasks: %w", err)
	}

	return tasks, total, nil
}

// DeleteTask 删除代码生成任务
func (s *CodeGenService) DeleteTask(taskID string, userID uint) error {
	if taskID == "" {
		return errors.New("task ID is required")
	}

	// 获取任务信息，检查权限
	task, err := s.codeGenRepo.GetTask(taskID)
	if err != nil {
		return fmt.Errorf("task not found: %w", err)
	}

	// 检查是否为任务创建者
	if task.UserID != userID {
		logger.Warn("Unauthorized task deletion attempt",
			zap.String("task_id", taskID),
			zap.Uint("user_id", userID),
			zap.Uint("task_owner", task.UserID),
		)
		return errors.New("permission denied")
	}

	// 如果任务正在运行，不允许删除
	if task.Status == model.TaskStatusRunning {
		return errors.New("cannot delete running task")
	}

	if err := s.codeGenRepo.DeleteTask(taskID); err != nil {
		logger.Error("Failed to delete task",
			zap.Error(err),
			zap.String("task_id", taskID),
		)
		return fmt.Errorf("failed to delete task: %w", err)
	}

	logger.Info("Code generation task deleted",
		zap.String("task_id", taskID),
		zap.Uint("user_id", userID),
	)

	return nil
}

// DownloadResult 下载生成结果
func (s *CodeGenService) DownloadResult(taskID string, userID uint) (io.Reader, string, error) {
	if taskID == "" {
		return nil, "", errors.New("task ID is required")
	}

	// 获取任务信息，检查权限
	task, err := s.codeGenRepo.GetTask(taskID)
	if err != nil {
		return nil, "", fmt.Errorf("task not found: %w", err)
	}

	// 检查是否为任务创建者
	if task.UserID != userID {
		logger.Warn("Unauthorized download attempt",
			zap.String("task_id", taskID),
			zap.Uint("user_id", userID),
			zap.Uint("task_owner", task.UserID),
		)
		return nil, "", errors.New("permission denied")
	}

	// 检查任务是否已完成
	if task.Status != model.TaskStatusCompleted {
		return nil, "", errors.New("task not completed")
	}

	if task.ResultURL == "" {
		return nil, "", errors.New("result file not found")
	}

	// 下载文件
	reader, filename, err := s.codeGenRepo.DownloadResult(taskID)
	if err != nil {
		logger.Error("Failed to download result",
			zap.Error(err),
			zap.String("task_id", taskID),
		)
		return nil, "", fmt.Errorf("failed to download result: %w", err)
	}

	logger.Info("Code generation result downloaded",
		zap.String("task_id", taskID),
		zap.Uint("user_id", userID),
		zap.String("filename", filename),
	)

	return reader, filename, nil
}

// executeCodeGeneration 执行代码生成（异步）
func (s *CodeGenService) executeCodeGeneration(task *model.CodeGenTask) {
	defer func() {
		if r := recover(); r != nil {
			logger.Error("Code generation panic",
				zap.Any("error", r),
				zap.String("task_id", task.TaskID),
			)
			s.codeGenRepo.SetTaskError(task.TaskID, fmt.Sprintf("Generation failed: %v", r))
		}
	}()

	logger.Info("Executing code generation",
		zap.String("task_id", task.TaskID),
		zap.Uint("template_id", task.TemplateID),
	)

	// 更新任务状态为运行中
	if err := s.codeGenRepo.UpdateTaskStatus(task.TaskID, model.TaskStatusRunning, 10); err != nil {
		logger.Error("Failed to update task status",
			zap.Error(err),
			zap.String("task_id", task.TaskID),
		)
		return
	}

	// 模拟代码生成过程
	stages := []struct {
		name     string
		progress int
		duration time.Duration
	}{
		{"解析模板", 20, 2 * time.Second},
		{"渲染代码", 40, 3 * time.Second},
		{"生成文件", 60, 2 * time.Second},
		{"打包压缩", 80, 1 * time.Second},
		{"上传结果", 90, 1 * time.Second},
		{"完成", 100, 500 * time.Millisecond},
	}

	for _, stage := range stages {
		logger.Info("Code generation stage",
			zap.String("task_id", task.TaskID),
			zap.String("stage", stage.name),
			zap.Int("progress", stage.progress),
		)

		// 更新进度
		if err := s.codeGenRepo.UpdateTaskStatus(task.TaskID, model.TaskStatusRunning, stage.progress); err != nil {
			logger.Error("Failed to update task progress",
				zap.Error(err),
				zap.String("task_id", task.TaskID),
				zap.String("stage", stage.name),
			)
		}

		// 模拟处理时间
		time.Sleep(stage.duration)
	}

	// 生成结果文件（这里是模拟）
	resultURL := fmt.Sprintf("/codeevolve/codegen/%s/result.zip", task.TaskID)

	// 模拟上传结果文件到MinIO
	// 这里应该实际生成代码文件并上传
	if err := s.codeGenRepo.SetTaskResult(task.TaskID, resultURL); err != nil {
		logger.Error("Failed to set task result",
			zap.Error(err),
			zap.String("task_id", task.TaskID),
		)
		s.codeGenRepo.SetTaskError(task.TaskID, "Failed to save result")
		return
	}

	// 更新任务状态为完成
	if err := s.codeGenRepo.UpdateTaskStatus(task.TaskID, model.TaskStatusCompleted, 100); err != nil {
		logger.Error("Failed to complete task",
			zap.Error(err),
			zap.String("task_id", task.TaskID),
		)
		return
	}

	logger.Info("Code generation completed",
		zap.String("task_id", task.TaskID),
		zap.String("result_url", resultURL),
	)
}

// generateTaskID 生成任务ID
func generateTaskID() string {
	// 使用UUID + 时间戳确保唯一性
	id := uuid.New()
	timestamp := time.Now().Unix()
	return fmt.Sprintf("%s-%d", strings.ReplaceAll(id.String(), "-", ""), timestamp)
}

// generateRandomString 生成随机字符串
func generateRandomString(length int) string {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return ""
	}
	return hex.EncodeToString(bytes)
}

// validateProjectName 验证项目名称
func validateProjectName(name string) error {
	if len(name) < 2 {
		return errors.New("project name too short")
	}
	if len(name) > 50 {
		return errors.New("project name too long")
	}

	// 检查字符
	for _, char := range name {
		if !isValidProjectNameChar(char) {
			return errors.New("project name contains invalid characters")
		}
	}

	return nil
}

// isValidProjectNameChar 检查项目名称字符是否有效
func isValidProjectNameChar(char rune) bool {
	return (char >= 'a' && char <= 'z') ||
		   (char >= 'A' && char <= 'Z') ||
		   (char >= '0' && char <= '9') ||
		   char == '-' || char == '_'
}

// GetTaskStats 获取任务统计信息
func (s *CodeGenService) GetTaskStats() (map[string]interface{}, error) {
	stats, err := s.codeGenRepo.GetTaskStats()
	if err != nil {
		logger.Error("Failed to get task stats", zap.Error(err))
		return nil, fmt.Errorf("failed to get task stats: %w", err)
	}

	// 计算成功率
	if totalTasks, ok := stats["total_tasks"].(int64); ok && totalTasks > 0 {
		if completedTasks, ok := stats["completed_tasks"].(int64); ok {
			successRate := float64(completedTasks) / float64(totalTasks) * 100
			stats["success_rate"] = fmt.Sprintf("%.2f%%", successRate)
		}
	}

	return stats, nil
}