package repo

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"path/filepath"
	"strings"

	"github.com/minio/minio-go/v7"
	"github.com/spf13/viper"
	"gorm.io/gorm"

	"codeevolve-backend/internal/model"
)

type TemplateRepo struct {
	db    *gorm.DB
	minio *minio.Client
}

func NewTemplateRepo(db *gorm.DB, minio *minio.Client) *TemplateRepo {
	return &TemplateRepo{
		db:    db,
		minio: minio,
	}
}

// GetAll 获取所有模板
func (r *TemplateRepo) GetAll(page, pageSize int, category string) ([]*model.Template, int64, error) {
	var templates []*model.Template
	var total int64

	query := r.db.Model(&model.Template{}).Where("status = ?", "active")

	if category != "" {
		query = query.Where("category = ?", category)
	}

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 分页查询
	offset := (page - 1) * pageSize
	if err := query.Preload("Creator").Offset(offset).Limit(pageSize).
		Order("download_count DESC, created_at DESC").Find(&templates).Error; err != nil {
		return nil, 0, err
	}

	return templates, total, nil
}

// GetByID 根据ID获取模板
func (r *TemplateRepo) GetByID(id uint) (*model.Template, error) {
	var template model.Template
	if err := r.db.Preload("Creator").First(&template, id).Error; err != nil {
		return nil, err
	}
	return &template, nil
}

// Create 创建模板
func (r *TemplateRepo) Create(template *model.Template) error {
	return r.db.Create(template).Error
}

// Update 更新模板
func (r *TemplateRepo) Update(template *model.Template) error {
	return r.db.Save(template).Error
}

// Delete 删除模板（软删除）
func (r *TemplateRepo) Delete(id uint) error {
	return r.db.Delete(&model.Template{}, id).Error
}

// UploadFile 上传模板文件
func (r *TemplateRepo) UploadFile(templateID uint, filename string, data io.Reader) (string, error) {
	bucketName := viper.GetString("minio.bucket_name")
	objectName := fmt.Sprintf("templates/%d/%s", templateID, filename)

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
	fileURL := fmt.Sprintf("/%s/%s", bucketName, objectName)

	// 更新模板的文件URL
	if err := r.db.Model(&model.Template{}).
		Where("id = ?", templateID).
		Update("file_url", fileURL).Error; err != nil {
		return "", err
	}

	return fileURL, nil
}

// DownloadFile 下载模板文件
func (r *TemplateRepo) DownloadFile(templateID uint) (io.Reader, string, error) {
	// 获取模板信息
	template, err := r.GetByID(templateID)
	if err != nil {
		return nil, "", err
	}

	if template.FileURL == "" {
		return nil, "", fmt.Errorf("template file not found")
	}

	// 解析文件路径
	bucketName := viper.GetString("minio.bucket_name")
	objectName := strings.TrimPrefix(template.FileURL, fmt.Sprintf("/%s/", bucketName))

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

	filename := filepath.Base(objectName)
	return bytes.NewReader(buf.Bytes()), filename, nil
}

// IncrementDownloadCount 增加下载次数
func (r *TemplateRepo) IncrementDownloadCount(id uint) error {
	return r.db.Model(&model.Template{}).
		Where("id = ?", id).
		Update("download_count", gorm.Expr("download_count + ?", 1)).Error
}

// GetConfigs 获取模板配置
func (r *TemplateRepo) GetConfigs(templateID uint) ([]*model.TemplateConfig, error) {
	var configs []*model.TemplateConfig
	if err := r.db.Where("template_id = ?", templateID).
		Order("config_key").Find(&configs).Error; err != nil {
		return nil, err
	}
	return configs, nil
}

// CreateConfig 创建模板配置
func (r *TemplateRepo) CreateConfig(config *model.TemplateConfig) error {
	return r.db.Create(config).Error
}

// UpdateConfig 更新模板配置
func (r *TemplateRepo) UpdateConfig(config *model.TemplateConfig) error {
	return r.db.Save(config).Error
}

// DeleteConfig 删除模板配置
func (r *TemplateRepo) DeleteConfig(id uint) error {
	return r.db.Delete(&model.TemplateConfig{}, id).Error
}

// GetPopularTemplates 获取热门模板
func (r *TemplateRepo) GetPopularTemplates(limit int) ([]*model.Template, error) {
	var templates []*model.Template
	if err := r.db.Where("status = ?", "active").
		Order("download_count DESC").
		Limit(limit).
		Preload("Creator").
		Find(&templates).Error; err != nil {
		return nil, err
	}
	return templates, nil
}

// SearchTemplates 搜索模板
func (r *TemplateRepo) SearchTemplates(keyword string, category string, page, pageSize int) ([]*model.Template, int64, error) {
	var templates []*model.Template
	var total int64

	query := r.db.Model(&model.Template{}).Where("status = ?", "active")

	if keyword != "" {
		query = query.Where("name LIKE ? OR description LIKE ?",
			fmt.Sprintf("%%%s%%", keyword),
			fmt.Sprintf("%%%s%%", keyword))
	}

	if category != "" {
		query = query.Where("category = ?", category)
	}

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 分页查询
	offset := (page - 1) * pageSize
	if err := query.Preload("Creator").Offset(offset).Limit(pageSize).
		Order("download_count DESC, created_at DESC").Find(&templates).Error; err != nil {
		return nil, 0, err
	}

	return templates, total, nil
}

// getContentType 根据文件扩展名获取Content-Type
func getContentType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".zip":
		return "application/zip"
	case ".tar":
		return "application/x-tar"
	case ".gz":
		return "application/gzip"
	case ".json":
		return "application/json"
	case ".yaml", ".yml":
		return "application/x-yaml"
	case ".txt":
		return "text/plain"
	default:
		return "application/octet-stream"
	}
}