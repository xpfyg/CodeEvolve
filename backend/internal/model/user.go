package model

import (
	"time"

	"gorm.io/gorm"
)

// User 用户表
type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Username  string         `json:"username" gorm:"size:50;uniqueIndex;not null;comment:用户名"`
	Email     string         `json:"email" gorm:"size:100;uniqueIndex;not null;comment:邮箱"`
	Password  string         `json:"-" gorm:"size:255;not null;comment:密码"`
	Nickname  string         `json:"nickname" gorm:"size:50;comment:昵称"`
	Avatar    string         `json:"avatar" gorm:"size:255;comment:头像URL"`
	Role      string         `json:"role" gorm:"size:20;default:user;comment:角色"`
	Status    string         `json:"status" gorm:"size:20;default:active;comment:状态"`
	LastLogin *time.Time     `json:"last_login" gorm:"comment:最后登录时间"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName 指定表名
func (User) TableName() string {
	return "users"
}

// UserProfile 用户资料（用于响应，不包含敏感信息）
type UserProfile struct {
	ID        uint       `json:"id"`
	Username  string     `json:"username"`
	Email     string     `json:"email"`
	Nickname  string     `json:"nickname"`
	Avatar    string     `json:"avatar"`
	Role      string     `json:"role"`
	Status    string     `json:"status"`
	LastLogin *time.Time `json:"last_login"`
	CreatedAt time.Time  `json:"created_at"`
}

// ToProfile 转换为用户资料
func (u *User) ToProfile() *UserProfile {
	return &UserProfile{
		ID:        u.ID,
		Username:  u.Username,
		Email:     u.Email,
		Nickname:  u.Nickname,
		Avatar:    u.Avatar,
		Role:      u.Role,
		Status:    u.Status,
		LastLogin: u.LastLogin,
		CreatedAt: u.CreatedAt,
	}
}