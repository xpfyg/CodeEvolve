package model

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// StringSlice 自定义类型，用于存储字符串数组到数据库
type StringSlice []string

func (s StringSlice) Value() (driver.Value, error) {
	if len(s) == 0 {
		return "[]", nil
	}
	return json.Marshal(s)
}

func (s *StringSlice) Scan(value interface{}) error {
	if value == nil {
		*s = StringSlice{}
		return nil
	}

	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, s)
	case string:
		return json.Unmarshal([]byte(v), s)
	}

	return nil
}

// Template 模板表
type Template struct {
	ID            uint         `json:"id" gorm:"primaryKey"`
	Name          string       `json:"name" gorm:"size:100;not null;comment:模板名称"`
	Description   string       `json:"description" gorm:"type:text;comment:模板描述"`
	Category      string       `json:"category" gorm:"size:50;not null;comment:模板分类"`
	TechStack     StringSlice  `json:"tech_stack" gorm:"type:json;comment:技术栈"`
	Version       string       `json:"version" gorm:"size:20;default:1.0.0;comment:版本号"`
	FileURL       string       `json:"file_url" gorm:"size:255;comment:模板文件URL"`
	PreviewImage  string       `json:"preview_image" gorm:"size:255;comment:预览图URL"`
	DownloadCount int          `json:"download_count" gorm:"default:0;comment:下载次数"`
	Status        string       `json:"status" gorm:"size:20;default:active;comment:状态"`
	CreatedBy     uint         `json:"created_by" gorm:"comment:创建者ID"`
	CreatedAt     time.Time    `json:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`

	// 关联
	Creator       User         `json:"creator,omitempty" gorm:"foreignKey:CreatedBy"`
}

// TableName 指定表名
func (Template) TableName() string {
	return "templates"
}

// TemplateConfig 模板配置参数
type TemplateConfig struct {
	ID           uint                   `json:"id" gorm:"primaryKey"`
	TemplateID   uint                   `json:"template_id" gorm:"not null;comment:模板ID"`
	ConfigKey    string                 `json:"config_key" gorm:"size:100;not null;comment:配置键"`
	ConfigName   string                 `json:"config_name" gorm:"size:100;not null;comment:配置名称"`
	ConfigType   string                 `json:"config_type" gorm:"size:50;not null;comment:配置类型"`
	DefaultValue string                 `json:"default_value" gorm:"type:text;comment:默认值"`
	Required     bool                   `json:"required" gorm:"default:false;comment:是否必填"`
	Description  string                 `json:"description" gorm:"type:text;comment:配置描述"`
	Options      map[string]interface{} `json:"options" gorm:"type:json;comment:配置选项"`
	CreatedAt    time.Time              `json:"created_at"`
	UpdatedAt    time.Time              `json:"updated_at"`

	// 关联
	Template     Template               `json:"template,omitempty" gorm:"foreignKey:TemplateID"`
}

// TableName 指定表名
func (TemplateConfig) TableName() string {
	return "template_configs"
}