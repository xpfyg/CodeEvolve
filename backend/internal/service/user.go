package service

import (
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
	"github.com/golang-jwt/jwt/v5"
	"github.com/spf13/viper"

	"codeevolve-backend/internal/model"
	"codeevolve-backend/internal/repo"
)

type UserService struct {
	userRepo *repo.UserRepo
}

func NewUserService(userRepo *repo.UserRepo) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

// Register 用户注册
func (s *UserService) Register(username, email, password string) (*model.User, error) {
	// 验证输入参数
	if username == "" || email == "" || password == "" {
		return nil, errors.New("username, email and password are required")
	}

	if len(password) < 6 {
		return nil, errors.New("password must be at least 6 characters")
	}

	// 检查用户名是否已存在
	exists, err := s.userRepo.ExistsByUsername(username)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("username already exists")
	}

	// 检查邮箱是否已存在
	exists, err = s.userRepo.ExistsByEmail(email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("email already exists")
	}

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// 创建用户
	user := &model.User{
		Username: username,
		Email:    email,
		Password: string(hashedPassword),
		Nickname: username, // 默认昵称为用户名
		Role:     "user",
		Status:   "active",
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

// Login 用户登录
func (s *UserService) Login(username, password string) (string, *model.UserProfile, error) {
	if username == "" || password == "" {
		return "", nil, errors.New("username and password are required")
	}

	// 获取用户信息
	user, err := s.userRepo.GetByUsername(username)
	if err != nil {
		// 也尝试通过邮箱查找
		user, err = s.userRepo.GetByEmail(username)
		if err != nil {
			return "", nil, errors.New("invalid username or password")
		}
	}

	// 检查用户状态
	if user.Status != "active" {
		return "", nil, errors.New("user account is not active")
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", nil, errors.New("invalid username or password")
	}

	// 生成JWT令牌
	token, err := s.generateJWT(user)
	if err != nil {
		return "", nil, err
	}

	// 更新最后登录时间
	s.userRepo.UpdateLastLogin(user.ID)

	// 缓存用户信息
	s.userRepo.CacheUser(user, 24*time.Hour)

	// 存储令牌到Redis
	expiration := time.Duration(viper.GetInt("jwt.expire_hours")) * time.Hour
	s.userRepo.StoreToken(user.ID, token, expiration)

	return token, user.ToProfile(), nil
}

// GetProfile 获取用户资料
func (s *UserService) GetProfile(userID uint) (*model.UserProfile, error) {
	// 先尝试从缓存获取
	profile, err := s.userRepo.GetCachedUser(userID)
	if err == nil && profile != nil {
		return profile, nil
	}

	// 从数据库获取
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, err
	}

	// 更新缓存
	s.userRepo.CacheUser(user, 24*time.Hour)

	return user.ToProfile(), nil
}

// UpdateProfile 更新用户资料
func (s *UserService) UpdateProfile(userID uint, updates map[string]interface{}) error {
	// 获取现有用户信息
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return err
	}

	// 更新允许的字段
	if nickname, ok := updates["nickname"].(string); ok && nickname != "" {
		user.Nickname = nickname
	}
	if avatar, ok := updates["avatar"].(string); ok {
		user.Avatar = avatar
	}
	if email, ok := updates["email"].(string); ok && email != "" {
		// 检查邮箱是否已存在（排除当前用户）
		existingUser, _ := s.userRepo.GetByEmail(email)
		if existingUser != nil && existingUser.ID != userID {
			return errors.New("email already exists")
		}
		user.Email = email
	}

	// 保存更新
	if err := s.userRepo.Update(user); err != nil {
		return err
	}

	// 移除缓存，强制下次重新加载
	s.userRepo.RemoveCachedUser(userID)

	return nil
}

// ChangePassword 修改密码
func (s *UserService) ChangePassword(userID uint, oldPassword, newPassword string) error {
	if oldPassword == "" || newPassword == "" {
		return errors.New("old password and new password are required")
	}

	if len(newPassword) < 6 {
		return errors.New("new password must be at least 6 characters")
	}

	// 获取用户信息
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return err
	}

	// 验证旧密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(oldPassword)); err != nil {
		return errors.New("invalid old password")
	}

	// 加密新密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// 更新密码
	user.Password = string(hashedPassword)
	if err := s.userRepo.Update(user); err != nil {
		return err
	}

	// 移除所有令牌，强制重新登录
	s.userRepo.RemoveToken(userID)

	return nil
}

// Logout 用户登出
func (s *UserService) Logout(userID uint) error {
	// 移除令牌
	s.userRepo.RemoveToken(userID)

	// 移除用户缓存
	s.userRepo.RemoveCachedUser(userID)

	return nil
}

// GetUserStats 获取用户统计信息
func (s *UserService) GetUserStats(userID uint) (map[string]interface{}, error) {
	return s.userRepo.GetUserStats(userID)
}

// VerifyToken 验证JWT令牌
func (s *UserService) VerifyToken(tokenString string) (*model.UserProfile, error) {
	// 解析JWT令牌
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(viper.GetString("jwt.secret")), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	// 获取用户ID
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	userID, ok := claims["user_id"].(float64)
	if !ok {
		return nil, errors.New("invalid user id in token")
	}

	// 检查令牌是否在Redis中存在
	storedToken, err := s.userRepo.GetToken(uint(userID))
	if err != nil {
		return nil, err
	}
	if storedToken != tokenString {
		return nil, errors.New("token not found or expired")
	}

	// 获取用户信息
	return s.GetProfile(uint(userID))
}

// generateJWT 生成JWT令牌
func (s *UserService) generateJWT(user *model.User) (string, error) {
	expireTime := time.Now().Add(time.Duration(viper.GetInt("jwt.expire_hours")) * time.Hour)

	claims := jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      expireTime.Unix(),
		"iat":      time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(viper.GetString("jwt.secret")))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}