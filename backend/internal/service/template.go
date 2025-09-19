package service

import (
	"errors"
	"fmt"
	"io"

	"codeevolve-backend/internal/model"
	"codeevolve-backend/internal/repo"
)

type TemplateService struct {
	templateRepo *repo.TemplateRepo
}

func NewTemplateService(templateRepo *repo.TemplateRepo) *TemplateService {
	return &TemplateService{
		templateRepo: templateRepo,
	}
}

// GetTemplates 获取模板列表
func (s *TemplateService) GetTemplates(page, pageSize int, category string) ([]*model.Template, int64, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	return s.templateRepo.GetAll(page, pageSize, category)
}

// GetTemplate 获取单个模板
func (s *TemplateService) GetTemplate(id uint) (*model.Template, error) {
	if id == 0 {
		return nil, errors.New("invalid template id")
	}

	return s.templateRepo.GetByID(id)
}

// CreateTemplate 创建模板
func (s *TemplateService) CreateTemplate(template *model.Template) error {
	// 验证必填字段
	if template.Name == "" {
		return errors.New("template name is required")
	}
	if template.Category == "" {
		return errors.New("template category is required")
	}
	if template.CreatedBy == 0 {
		return errors.New("creator id is required")
	}

	// 设置默认值
	if template.Version == "" {
		template.Version = "1.0.0"
	}
	if template.Status == "" {
		template.Status = "active"
	}

	return s.templateRepo.Create(template)
}

// UpdateTemplate 更新模板
func (s *TemplateService) UpdateTemplate(id uint, updates *model.Template) error {
	if id == 0 {
		return errors.New("invalid template id")
	}

	// 获取现有模板
	existing, err := s.templateRepo.GetByID(id)
	if err != nil {
		return fmt.Errorf("template not found: %w", err)
	}

	// 更新字段
	if updates.Name != "" {
		existing.Name = updates.Name
	}
	if updates.Description != "" {
		existing.Description = updates.Description
	}
	if updates.Category != "" {
		existing.Category = updates.Category
	}
	if len(updates.TechStack) > 0 {
		existing.TechStack = updates.TechStack
	}
	if updates.Version != "" {
		existing.Version = updates.Version
	}
	if updates.PreviewImage != "" {
		existing.PreviewImage = updates.PreviewImage
	}
	if updates.Status != "" {
		existing.Status = updates.Status
	}

	return s.templateRepo.Update(existing)
}

// DeleteTemplate 删除模板
func (s *TemplateService) DeleteTemplate(id uint, userID uint) error {
	if id == 0 {
		return errors.New("invalid template id")
	}

	// 获取模板信息，检查权限
	template, err := s.templateRepo.GetByID(id)
	if err != nil {
		return fmt.Errorf("template not found: %w", err)
	}

	// 检查是否为创建者或管理员
	if template.CreatedBy != userID {
		// 这里可以添加管理员角色检查
		return errors.New("permission denied")
	}

	return s.templateRepo.Delete(id)
}

// GetTemplateConfigs 获取模板配置
func (s *TemplateService) GetTemplateConfigs(templateID uint) ([]*model.TemplateConfig, error) {
	if templateID == 0 {
		return nil, errors.New("invalid template id")
	}

	// 检查模板是否存在
	_, err := s.templateRepo.GetByID(templateID)
	if err != nil {
		return nil, fmt.Errorf("template not found: %w", err)
	}

	return s.templateRepo.GetConfigs(templateID)
}

// CreateTemplateConfig 创建模板配置
func (s *TemplateService) CreateTemplateConfig(config *model.TemplateConfig) error {
	// 验证必填字段
	if config.TemplateID == 0 {
		return errors.New("template id is required")
	}
	if config.ConfigKey == "" {
		return errors.New("config key is required")
	}
	if config.ConfigName == "" {
		return errors.New("config name is required")
	}
	if config.ConfigType == "" {
		return errors.New("config type is required")
	}

	// 检查模板是否存在
	_, err := s.templateRepo.GetByID(config.TemplateID)
	if err != nil {
		return fmt.Errorf("template not found: %w", err)
	}

	return s.templateRepo.CreateConfig(config)
}

// UpdateTemplateConfig 更新模板配置
func (s *TemplateService) UpdateTemplateConfig(id uint, updates *model.TemplateConfig) error {
	// 实现配置更新逻辑
	updates.ID = id
	return s.templateRepo.UpdateConfig(updates)
}

// DeleteTemplateConfig 删除模板配置
func (s *TemplateService) DeleteTemplateConfig(id uint, templateID uint) error {
	if id == 0 {
		return errors.New("invalid config id")
	}

	return s.templateRepo.DeleteConfig(id)
}

// GetPopularTemplates 获取热门模板
func (s *TemplateService) GetPopularTemplates(limit int) ([]*model.Template, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}

	return s.templateRepo.GetPopularTemplates(limit)
}

// SearchTemplates 搜索模板
func (s *TemplateService) SearchTemplates(keyword, category string, page, pageSize int) ([]*model.Template, int64, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	return s.templateRepo.SearchTemplates(keyword, category, page, pageSize)
}

// DownloadTemplate 下载模板
func (s *TemplateService) DownloadTemplate(id uint) error {
	// 增加下载计数
	err := s.templateRepo.IncrementDownloadCount(id)
	if err != nil {
		return fmt.Errorf("failed to update download count: %w", err)
	}

	return nil
}

// UploadFile 上传模板文件
func (s *TemplateService) UploadFile(templateID uint, filename string, data io.Reader) (string, error) {
	if templateID == 0 {
		return "", errors.New("invalid template id")
	}
	if filename == "" {
		return "", errors.New("filename is required")
	}

	// 检查模板是否存在
	_, err := s.templateRepo.GetByID(templateID)
	if err != nil {
		return "", fmt.Errorf("template not found: %w", err)
	}

	return s.templateRepo.UploadFile(templateID, filename, data)
}