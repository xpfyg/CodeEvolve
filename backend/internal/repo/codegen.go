package repo

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/spf13/viper"
	"gorm.io/gorm"

	"codeevolve-backend/internal/model"
)

type CodeGenRepo struct {
	db    *gorm.DB
	minio *minio.Client
}

func NewCodeGenRepo(db *gorm.DB, minio *minio.Client) *CodeGenRepo {
	return &CodeGenRepo{
		db:    db,
		minio: minio,
	}
}

// CreateTask 创建代码生成任务
func (r *CodeGenRepo) CreateTask(task *model.CodeGenTask) error {
	return r.db.Create(task).Error
}

// GetTask 获取代码生成任务
func (r *CodeGenRepo) GetTask(taskID string) (*model.CodeGenTask, error) {
	var task model.CodeGenTask
	if err := r.db.Where("task_id = ?", taskID).
		Preload("User").
		Preload("Template").
		First(&task).Error; err != nil {
		return nil, err
	}
	return &task, nil
}

// GetTaskByID 根据数据库ID获取任务
func (r *CodeGenRepo) GetTaskByID(id uint) (*model.CodeGenTask, error) {
	var task model.CodeGenTask
	if err := r.db.Preload("User").Preload("Template").First(&task, id).Error; err != nil {
		return nil, err
	}
	return &task, nil
}

// UpdateTask 更新代码生成任务
func (r *CodeGenRepo) UpdateTask(task *model.CodeGenTask) error {
	return r.db.Save(task).Error
}

// UpdateTaskStatus 更新任务状态
func (r *CodeGenRepo) UpdateTaskStatus(taskID string, status string, progress int) error {
	updates := map[string]interface{}{
		"status":   status,
		"progress": progress,
	}

	if status == model.TaskStatusRunning && progress == 0 {
		now := time.Now()
		updates["started_at"] = &now
	}

	if status == model.TaskStatusCompleted || status == model.TaskStatusFailed {
		now := time.Now()
		updates["completed_at"] = &now
	}

	return r.db.Model(&model.CodeGenTask{}).
		Where("task_id = ?", taskID).
		Updates(updates).Error
}

// SetTaskResult 设置任务结果
func (r *CodeGenRepo) SetTaskResult(taskID string, resultURL string) error {
	return r.db.Model(&model.CodeGenTask{}).
		Where("task_id = ?", taskID).
		Update("result_url", resultURL).Error
}

// SetTaskError 设置任务错误信息
func (r *CodeGenRepo) SetTaskError(taskID string, errorMsg string) error {
	now := time.Now()
	return r.db.Model(&model.CodeGenTask{}).
		Where("task_id = ?", taskID).
		Updates(map[string]interface{}{
			"status":       model.TaskStatusFailed,
			"error_msg":    errorMsg,
			"completed_at": &now,
		}).Error
}

// GetUserTasks 获取用户的代码生成任务列表
func (r *CodeGenRepo) GetUserTasks(userID uint, page, pageSize int) ([]*model.CodeGenTask, int64, error) {
	var tasks []*model.CodeGenTask
	var total int64

	query := r.db.Model(&model.CodeGenTask{}).Where("user_id = ?", userID)

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 分页查询
	offset := (page - 1) * pageSize
	if err := query.Preload("Template").Offset(offset).Limit(pageSize).
		Order("created_at DESC").Find(&tasks).Error; err != nil {
		return nil, 0, err
	}

	return tasks, total, nil
}

// UploadResult 上传生成结果文件
func (r *CodeGenRepo) UploadResult(taskID string, filename string, data io.Reader) (string, error) {
	bucketName := viper.GetString("minio.bucket_name")
	objectName := fmt.Sprintf("codegen/%s/%s", taskID, filename)

	// 上传文件
	_, err := r.minio.PutObject(
		context.Background(),
		bucketName,
		objectName,
		data,
		-1,
		minio.PutObjectOptions{
			ContentType: getContentType(filename),
		},
	)
	if err != nil {
		return "", err
	}

	// 生成访问URL
	resultURL := fmt.Sprintf("/%s/%s", bucketName, objectName)

	// 更新任务的结果URL
	if err := r.SetTaskResult(taskID, resultURL); err != nil {
		return "", err
	}

	return resultURL, nil
}

// DownloadResult 下载生成结果文件
func (r *CodeGenRepo) DownloadResult(taskID string) (io.Reader, string, error) {
	// 获取任务信息
	task, err := r.GetTask(taskID)
	if err != nil {
		return nil, "", err
	}

	if task.ResultURL == "" {
		return nil, "", fmt.Errorf("result file not found")
	}

	// 解析文件路径
	bucketName := viper.GetString("minio.bucket_name")
	objectName := fmt.Sprintf("codegen/%s", taskID)

	// 从MinIO下载文件
	object, err := r.minio.GetObject(
		context.Background(),
		bucketName,
		objectName,
		minio.GetObjectOptions{},
	)
	if err != nil {
		return nil, "", err
	}

	// 读取文件内容
	buf := new(bytes.Buffer)
	if _, err := io.Copy(buf, object); err != nil {
		return nil, "", err
	}
	object.Close()

	filename := fmt.Sprintf("%s-result.zip", taskID)
	return bytes.NewReader(buf.Bytes()), filename, nil
}

// DeleteTask 删除代码生成任务
func (r *CodeGenRepo) DeleteTask(taskID string) error {
	return r.db.Where("task_id = ?", taskID).Delete(&model.CodeGenTask{}).Error
}

// === AI定制任务相关方法 ===

// CreateAITask 创建AI定制任务
func (r *CodeGenRepo) CreateAITask(task *model.AICustomTask) error {
	return r.db.Create(task).Error
}

// GetAITask 获取AI定制任务
func (r *CodeGenRepo) GetAITask(taskID string) (*model.AICustomTask, error) {
	var task model.AICustomTask
	if err := r.db.Where("task_id = ?", taskID).
		Preload("User").
		Preload("CodeGenTask").
		First(&task).Error; err != nil {
		return nil, err
	}
	return &task, nil
}

// UpdateAITask 更新AI定制任务
func (r *CodeGenRepo) UpdateAITask(task *model.AICustomTask) error {
	return r.db.Save(task).Error
}

// UpdateAITaskStatus 更新AI任务状态
func (r *CodeGenRepo) UpdateAITaskStatus(taskID string, status string, progress int) error {
	updates := map[string]interface{}{
		"status":   status,
		"progress": progress,
	}

	if status == model.TaskStatusRunning && progress == 0 {
		now := time.Now()
		updates["started_at"] = &now
	}

	if status == model.TaskStatusCompleted || status == model.TaskStatusFailed {
		now := time.Now()
		updates["completed_at"] = &now
	}

	return r.db.Model(&model.AICustomTask{}).
		Where("task_id = ?", taskID).
		Updates(updates).Error
}

// SetAITaskResult 设置AI任务结果
func (r *CodeGenRepo) SetAITaskResult(taskID string, customCode string) error {
	now := time.Now()
	return r.db.Model(&model.AICustomTask{}).
		Where("task_id = ?", taskID).
		Updates(map[string]interface{}{
			"custom_code":  customCode,
			"status":       model.TaskStatusCompleted,
			"progress":     100,
			"completed_at": &now,
		}).Error
}

// SetAITaskError 设置AI任务错误信息
func (r *CodeGenRepo) SetAITaskError(taskID string, errorMsg string) error {
	now := time.Now()
	return r.db.Model(&model.AICustomTask{}).
		Where("task_id = ?", taskID).
		Updates(map[string]interface{}{
			"status":       model.TaskStatusFailed,
			"error_msg":    errorMsg,
			"completed_at": &now,
		}).Error
}

// GetUserAITasks 获取用户的AI定制任务列表
func (r *CodeGenRepo) GetUserAITasks(userID uint, page, pageSize int) ([]*model.AICustomTask, int64, error) {
	var tasks []*model.AICustomTask
	var total int64

	query := r.db.Model(&model.AICustomTask{}).Where("user_id = ?", userID)

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 分页查询
	offset := (page - 1) * pageSize
	if err := query.Preload("CodeGenTask").Offset(offset).Limit(pageSize).
		Order("created_at DESC").Find(&tasks).Error; err != nil {
		return nil, 0, err
	}

	return tasks, total, nil
}

// GetTaskStats 获取任务统计信息
func (r *CodeGenRepo) GetTaskStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// 总任务数
	var totalTasks int64
	if err := r.db.Model(&model.CodeGenTask{}).Count(&totalTasks).Error; err != nil {
		return nil, err
	}
	stats["total_tasks"] = totalTasks

	// 已完成任务数
	var completedTasks int64
	if err := r.db.Model(&model.CodeGenTask{}).
		Where("status = ?", model.TaskStatusCompleted).
		Count(&completedTasks).Error; err != nil {
		return nil, err
	}
	stats["completed_tasks"] = completedTasks

	// 失败任务数
	var failedTasks int64
	if err := r.db.Model(&model.CodeGenTask{}).
		Where("status = ?", model.TaskStatusFailed).
		Count(&failedTasks).Error; err != nil {
		return nil, err
	}
	stats["failed_tasks"] = failedTasks

	// 总AI任务数
	var totalAITasks int64
	if err := r.db.Model(&model.AICustomTask{}).Count(&totalAITasks).Error; err != nil {
		return nil, err
	}
	stats["total_ai_tasks"] = totalAITasks

	// 已完成AI任务数
	var completedAITasks int64
	if err := r.db.Model(&model.AICustomTask{}).
		Where("status = ?", model.TaskStatusCompleted).
		Count(&completedAITasks).Error; err != nil {
		return nil, err
	}
	stats["completed_ai_tasks"] = completedAITasks

	return stats, nil
}