package service

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/spf13/viper"
	"go.uber.org/zap"

	"codeevolve-backend/pkg/logger"
)

type AIService struct {
	apiURL     string
	timeout    time.Duration
	httpClient *http.Client
}

func NewAIService() *AIService {
	timeout := viper.GetDuration("ai.timeout")
	if timeout == 0 {
		timeout = 30 * time.Second
	}

	return &AIService{
		apiURL:  viper.GetString("ai.api_url"),
		timeout: timeout,
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

// RequirementRequest AI需求解析请求
type RequirementRequest struct {
	Requirement string                 `json:"requirement"`
	Context     map[string]interface{} `json:"context,omitempty"`
	Language    string                 `json:"language,omitempty"`
}

// RequirementResponse AI需求解析响应
type RequirementResponse struct {
	TaskID       string                 `json:"task_id"`
	Instructions []TechnicalInstruction `json:"instructions"`
	Confidence   float64                `json:"confidence"`
	Suggestions  []string               `json:"suggestions"`
}

// TechnicalInstruction 技术指令
type TechnicalInstruction struct {
	Type          string   `json:"type"`
	Action        string   `json:"action"`
	Target        string   `json:"target"`
	Priority      string   `json:"priority"`
	EstimatedTime string   `json:"estimated_time"`
	Dependencies  []string `json:"dependencies"`
}

// CustomizationRequest AI代码定制请求
type CustomizationRequest struct {
	OriginalCode string                 `json:"original_code"`
	Requirement  string                 `json:"requirement"`
	Context      map[string]interface{} `json:"context,omitempty"`
	Options      map[string]interface{} `json:"options,omitempty"`
}

// CustomizationResponse AI代码定制响应
type CustomizationResponse struct {
	TaskID        string    `json:"task_id"`
	Status        string    `json:"status"`
	CustomizedCode string   `json:"customized_code"`
	Changes       []CodeDiff `json:"changes"`
	Explanation   string    `json:"explanation"`
	Confidence    float64   `json:"confidence"`
}

// CodeDiff 代码差异
type CodeDiff struct {
	FilePath      string         `json:"file_path"`
	OriginalLines []string       `json:"original_lines"`
	ModifiedLines []string       `json:"modified_lines"`
	ChangeType    string         `json:"change_type"`
	LineNumbers   map[string]int `json:"line_numbers"`
}

// ParseRequirement 解析用户需求
func (s *AIService) ParseRequirement(requirement string, context map[string]interface{}) (*RequirementResponse, error) {
	if requirement == "" {
		return nil, errors.New("requirement is required")
	}

	logger.Info("Parsing requirement with AI",
		zap.String("requirement", requirement[:min(len(requirement), 100)]),
	)

	// 构建请求
	req := &RequirementRequest{
		Requirement: requirement,
		Context:     context,
		Language:    "zh",
	}

	// 调用AI服务
	response, err := s.callAIService("/api/v1/requirements/parse", req)
	if err != nil {
		logger.Error("Failed to parse requirement",
			zap.Error(err),
			zap.String("requirement", requirement[:min(len(requirement), 100)]),
		)
		return nil, fmt.Errorf("failed to parse requirement: %w", err)
	}

	// 解析响应
	var result RequirementResponse
	if err := json.Unmarshal(response, &result); err != nil {
		logger.Error("Failed to unmarshal AI response",
			zap.Error(err),
		)
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	logger.Info("Requirement parsed successfully",
		zap.String("task_id", result.TaskID),
		zap.Float64("confidence", result.Confidence),
		zap.Int("instructions_count", len(result.Instructions)),
	)

	return &result, nil
}

// CustomizeCode 定制代码
func (s *AIService) CustomizeCode(originalCode, requirement string, context map[string]interface{}) (*CustomizationResponse, error) {
	if originalCode == "" {
		return nil, errors.New("original code is required")
	}
	if requirement == "" {
		return nil, errors.New("requirement is required")
	}

	logger.Info("Customizing code with AI",
		zap.String("requirement", requirement[:min(len(requirement), 100)]),
		zap.Int("code_length", len(originalCode)),
	)

	// 构建请求
	req := &CustomizationRequest{
		OriginalCode: originalCode,
		Requirement:  requirement,
		Context:      context,
	}

	// 调用AI服务
	response, err := s.callAIService("/api/v1/codegen/customize", req)
	if err != nil {
		logger.Error("Failed to customize code",
			zap.Error(err),
			zap.String("requirement", requirement[:min(len(requirement), 100)]),
		)
		return nil, fmt.Errorf("failed to customize code: %w", err)
	}

	// 解析响应
	var result CustomizationResponse
	if err := json.Unmarshal(response, &result); err != nil {
		logger.Error("Failed to unmarshal AI response",
			zap.Error(err),
		)
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	logger.Info("Code customized successfully",
		zap.String("task_id", result.TaskID),
		zap.Float64("confidence", result.Confidence),
		zap.Int("changes_count", len(result.Changes)),
	)

	return &result, nil
}

// ValidateRequirement 验证需求
func (s *AIService) ValidateRequirement(requirement string, context map[string]interface{}) (map[string]interface{}, error) {
	if requirement == "" {
		return nil, errors.New("requirement is required")
	}

	logger.Info("Validating requirement with AI",
		zap.String("requirement", requirement[:min(len(requirement), 100)]),
	)

	// 构建请求
	req := &RequirementRequest{
		Requirement: requirement,
		Context:     context,
		Language:    "zh",
	}

	// 调用AI服务
	response, err := s.callAIService("/api/v1/requirements/validate", req)
	if err != nil {
		logger.Error("Failed to validate requirement",
			zap.Error(err),
		)
		return nil, fmt.Errorf("failed to validate requirement: %w", err)
	}

	// 解析响应
	var result map[string]interface{}
	if err := json.Unmarshal(response, &result); err != nil {
		logger.Error("Failed to unmarshal AI response",
			zap.Error(err),
		)
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	return result, nil
}

// GetExamples 获取需求示例
func (s *AIService) GetExamples() (map[string]interface{}, error) {
	logger.Info("Getting requirement examples from AI")

	// 调用AI服务
	response, err := s.callAIService("/api/v1/requirements/examples", nil)
	if err != nil {
		logger.Error("Failed to get examples",
			zap.Error(err),
		)
		return nil, fmt.Errorf("failed to get examples: %w", err)
	}

	// 解析响应
	var result map[string]interface{}
	if err := json.Unmarshal(response, &result); err != nil {
		logger.Error("Failed to unmarshal AI response",
			zap.Error(err),
		)
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	return result, nil
}

// GetTemplates 获取需求模板
func (s *AIService) GetTemplates() ([]map[string]interface{}, error) {
	logger.Info("Getting requirement templates from AI")

	// 调用AI服务
	response, err := s.callAIService("/api/v1/requirements/templates", nil)
	if err != nil {
		logger.Error("Failed to get templates",
			zap.Error(err),
		)
		return nil, fmt.Errorf("failed to get templates: %w", err)
	}

	// 解析响应
	var result []map[string]interface{}
	if err := json.Unmarshal(response, &result); err != nil {
		logger.Error("Failed to unmarshal AI response",
			zap.Error(err),
		)
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	return result, nil
}

// CheckHealth 检查AI服务健康状态
func (s *AIService) CheckHealth() error {
	logger.Info("Checking AI service health")

	// 调用健康检查接口
	response, err := s.callAIService("/health", nil)
	if err != nil {
		logger.Error("AI service health check failed",
			zap.Error(err),
		)
		return fmt.Errorf("AI service unavailable: %w", err)
	}

	// 解析响应
	var result map[string]interface{}
	if err := json.Unmarshal(response, &result); err != nil {
		logger.Error("Failed to unmarshal health response",
			zap.Error(err),
		)
		return fmt.Errorf("failed to parse health response: %w", err)
	}

	status, ok := result["status"].(string)
	if !ok || status != "ok" {
		return errors.New("AI service is not healthy")
	}

	logger.Info("AI service is healthy")
	return nil
}

// callAIService 调用AI服务的通用方法
func (s *AIService) callAIService(endpoint string, data interface{}) ([]byte, error) {
	if s.apiURL == "" {
		return nil, errors.New("AI service URL not configured")
	}

	url := s.apiURL + endpoint

	// 构建请求体
	var reqBody []byte
	var err error
	if data != nil {
		reqBody, err = json.Marshal(data)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request: %w", err)
		}
	}

	// 创建HTTP请求
	var req *http.Request
	if reqBody != nil {
		req, err = http.NewRequest("POST", url, bytes.NewBuffer(reqBody))
		if err != nil {
			return nil, fmt.Errorf("failed to create request: %w", err)
		}
		req.Header.Set("Content-Type", "application/json")
	} else {
		req, err = http.NewRequest("GET", url, nil)
		if err != nil {
			return nil, fmt.Errorf("failed to create request: %w", err)
		}
	}

	// 设置请求头
	req.Header.Set("User-Agent", "CodeEvolve-Backend/1.0")
	req.Header.Set("Accept", "application/json")

	// 发送请求
	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// 读取响应
	respBody := &bytes.Buffer{}
	if _, err := respBody.ReadFrom(resp.Body); err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// 检查状态码
	if resp.StatusCode != http.StatusOK {
		logger.Error("AI service returned error",
			zap.Int("status_code", resp.StatusCode),
			zap.String("response", respBody.String()),
		)
		return nil, fmt.Errorf("AI service returned status %d: %s", resp.StatusCode, respBody.String())
	}

	return respBody.Bytes(), nil
}

// min 返回两个整数中的较小值
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}