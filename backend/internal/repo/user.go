package repo

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	"codeevolve-backend/internal/model"
)

type UserRepo struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewUserRepo(db *gorm.DB, redis *redis.Client) *UserRepo {
	return &UserRepo{
		db:    db,
		redis: redis,
	}
}

// Create 创建用户
func (r *UserRepo) Create(user *model.User) error {
	return r.db.Create(user).Error
}

// GetByID 根据ID获取用户
func (r *UserRepo) GetByID(id uint) (*model.User, error) {
	var user model.User
	if err := r.db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByUsername 根据用户名获取用户
func (r *UserRepo) GetByUsername(username string) (*model.User, error) {
	var user model.User
	if err := r.db.Where("username = ?", username).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByEmail 根据邮箱获取用户
func (r *UserRepo) GetByEmail(email string) (*model.User, error) {
	var user model.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// Update 更新用户
func (r *UserRepo) Update(user *model.User) error {
	return r.db.Save(user).Error
}

// UpdateLastLogin 更新最后登录时间
func (r *UserRepo) UpdateLastLogin(id uint) error {
	now := time.Now()
	return r.db.Model(&model.User{}).
		Where("id = ?", id).
		Update("last_login", &now).Error
}

// Delete 删除用户（软删除）
func (r *UserRepo) Delete(id uint) error {
	return r.db.Delete(&model.User{}, id).Error
}

// ExistsByUsername 检查用户名是否存在
func (r *UserRepo) ExistsByUsername(username string) (bool, error) {
	var count int64
	if err := r.db.Model(&model.User{}).
		Where("username = ?", username).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// ExistsByEmail 检查邮箱是否存在
func (r *UserRepo) ExistsByEmail(email string) (bool, error) {
	var count int64
	if err := r.db.Model(&model.User{}).
		Where("email = ?", email).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// CacheUser 缓存用户信息
func (r *UserRepo) CacheUser(user *model.User, expiration time.Duration) error {
	ctx := context.Background()
	key := fmt.Sprintf("user:%d", user.ID)

	userJSON, err := json.Marshal(user.ToProfile())
	if err != nil {
		return err
	}

	return r.redis.Set(ctx, key, userJSON, expiration).Err()
}

// GetCachedUser 从缓存获取用户信息
func (r *UserRepo) GetCachedUser(id uint) (*model.UserProfile, error) {
	ctx := context.Background()
	key := fmt.Sprintf("user:%d", id)

	userJSON, err := r.redis.Get(ctx, key).Result()
	if err == redis.Nil {
		return nil, nil // 缓存未命中
	}
	if err != nil {
		return nil, err
	}

	var profile model.UserProfile
	if err := json.Unmarshal([]byte(userJSON), &profile); err != nil {
		return nil, err
	}

	return &profile, nil
}

// RemoveCachedUser 移除用户缓存
func (r *UserRepo) RemoveCachedUser(id uint) error {
	ctx := context.Background()
	key := fmt.Sprintf("user:%d", id)
	return r.redis.Del(ctx, key).Err()
}

// StoreToken 存储JWT令牌到Redis
func (r *UserRepo) StoreToken(userID uint, token string, expiration time.Duration) error {
	ctx := context.Background()
	key := fmt.Sprintf("token:%d", userID)
	return r.redis.Set(ctx, key, token, expiration).Err()
}

// GetToken 获取JWT令牌
func (r *UserRepo) GetToken(userID uint) (string, error) {
	ctx := context.Background()
	key := fmt.Sprintf("token:%d", userID)

	token, err := r.redis.Get(ctx, key).Result()
	if err == redis.Nil {
		return "", nil
	}
	return token, err
}

// RemoveToken 移除JWT令牌
func (r *UserRepo) RemoveToken(userID uint) error {
	ctx := context.Background()
	key := fmt.Sprintf("token:%d", userID)
	return r.redis.Del(ctx, key).Err()
}

// GetUserStats 获取用户统计信息
func (r *UserRepo) GetUserStats(userID uint) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// 创建的模板数量
	var templateCount int64
	if err := r.db.Model(&model.Template{}).
		Where("created_by = ? AND status = ?", userID, "active").
		Count(&templateCount).Error; err != nil {
		return nil, err
	}
	stats["template_count"] = templateCount

	// 生成的代码任务数量
	var codeGenCount int64
	if err := r.db.Model(&model.CodeGenTask{}).
		Where("user_id = ?", userID).
		Count(&codeGenCount).Error; err != nil {
		return nil, err
	}
	stats["code_gen_count"] = codeGenCount

	// AI定制任务数量
	var aiCustomCount int64
	if err := r.db.Model(&model.AICustomTask{}).
		Where("user_id = ?", userID).
		Count(&aiCustomCount).Error; err != nil {
		return nil, err
	}
	stats["ai_custom_count"] = aiCustomCount

	return stats, nil
}