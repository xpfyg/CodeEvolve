package model

import (
	"time"

	"gorm.io/gorm"
)

// CodeGenTask 代码生成任务
type CodeGenTask struct {
	ID           uint                   `json:"id" gorm:"primaryKey"`
	TaskID       string                 `json:"task_id" gorm:"size:64;uniqueIndex;not null;comment:任务ID"`
	UserID       uint                   `json:"user_id" gorm:"not null;comment:用户ID"`
	TemplateID   uint                   `json:"template_id" gorm:"not null;comment:模板ID"`
	ProjectName  string                 `json:"project_name" gorm:"size:100;not null;comment:项目名称"`
	Description  string                 `json:"description" gorm:"type:text;comment:项目描述"`
	Config       map[string]interface{} `json:"config" gorm:"type:json;comment:生成配置"`
	Status       string                 `json:"status" gorm:"size:20;default:pending;comment:任务状态"`
	Progress     int                    `json:"progress" gorm:"default:0;comment:进度百分比"`
	ResultURL    string                 `json:"result_url" gorm:"size:255;comment:结果文件URL"`
	ErrorMsg     string                 `json:"error_msg" gorm:"type:text;comment:错误信息"`
	StartedAt    *time.Time             `json:"started_at" gorm:"comment:开始时间"`
	CompletedAt  *time.Time             `json:"completed_at" gorm:"comment:完成时间"`
	CreatedAt    time.Time              `json:"created_at"`
	UpdatedAt    time.Time              `json:"updated_at"`
	DeletedAt    gorm.DeletedAt         `json:"-" gorm:"index"`

	// 关联
	User         User                   `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Template     Template               `json:"template,omitempty" gorm:"foreignKey:TemplateID"`
}

// TableName 指定表名
func (CodeGenTask) TableName() string {
	return "code_gen_tasks"
}

// AICustomTask AI定制任务
type AICustomTask struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	TaskID       string         `json:"task_id" gorm:"size:64;uniqueIndex;not null;comment:任务ID"`
	UserID       uint           `json:"user_id" gorm:"not null;comment:用户ID"`
	CodeGenID    uint           `json:"code_gen_id" gorm:"comment:关联的代码生成任务ID"`
	Requirement  string         `json:"requirement" gorm:"type:text;not null;comment:用户需求"`
	OriginalCode string         `json:"original_code" gorm:"type:longtext;comment:原始代码"`
	CustomCode   string         `json:"custom_code" gorm:"type:longtext;comment:定制后代码"`
	Status       string         `json:"status" gorm:"size:20;default:pending;comment:任务状态"`
	Progress     int            `json:"progress" gorm:"default:0;comment:进度百分比"`
	ErrorMsg     string         `json:"error_msg" gorm:"type:text;comment:错误信息"`
	StartedAt    *time.Time     `json:"started_at" gorm:"comment:开始时间"`
	CompletedAt  *time.Time     `json:"completed_at" gorm:"comment:完成时间"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`

	// 关联
	User         User           `json:"user,omitempty" gorm:"foreignKey:UserID"`
	CodeGenTask  CodeGenTask    `json:"code_gen_task,omitempty" gorm:"foreignKey:CodeGenID"`
}

// TableName 指定表名
func (AICustomTask) TableName() string {
	return "ai_custom_tasks"
}

// TaskStatus 任务状态常量
const (
	TaskStatusPending    = "pending"    // 等待中
	TaskStatusRunning    = "running"    // 执行中
	TaskStatusCompleted  = "completed"  // 已完成
	TaskStatusFailed     = "failed"     // 失败
	TaskStatusCancelled  = "cancelled"  // 已取消
)