-- CodeEvolve 数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS codeevolve DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE codeevolve;

-- 插入默认用户
INSERT IGNORE INTO users (id, username, email, password, nickname, role, status, created_at, updated_at) VALUES
(1, 'admin', 'admin@codeevolve.com', '$2a$10$8X8X8X8X8X8X8X8X8X8X8O', '管理员', 'admin', 'active', NOW(), NOW()),
(2, 'demo', 'demo@codeevolve.com', '$2a$10$8X8X8X8X8X8X8X8X8X8X8O', '演示用户', 'user', 'active', NOW(), NOW());

-- 插入默认模板
INSERT IGNORE INTO templates (id, name, description, category, tech_stack, version, download_count, status, created_by, created_at, updated_at) VALUES
(1, 'React + Ant Design 管理后台', '基于React 18 + Ant Design Pro的现代化管理后台模板，包含用户管理、权限控制、数据展示等功能', '前端', '["React", "TypeScript", "Ant Design", "Umi"]', '1.0.0', 1234, 'active', 1, NOW(), NOW()),
(2, 'Golang + Gin REST API', '高性能Go后端API服务模板，包含JWT认证、CRUD操作、中间件、数据库操作等', '后端', '["Golang", "Gin", "GORM", "MySQL"]', '1.0.0', 890, 'active', 1, NOW(), NOW()),
(3, 'Vue3 + Element Plus 电商前端', 'Vue3 Composition API + Element Plus电商管理系统，支持商品管理、订单处理、数据统计', '前端', '["Vue3", "TypeScript", "Element Plus", "Vite"]', '1.0.0', 567, 'active', 1, NOW(), NOW()),
(4, 'Spring Boot + MyBatis API', 'Java Spring Boot企业级后端API模板，包含安全认证、数据访问、事务管理', '后端', '["Java", "Spring Boot", "MyBatis", "MySQL"]', '1.0.0', 445, 'active', 1, NOW(), NOW());

-- 插入模板配置
INSERT IGNORE INTO template_configs (template_id, config_key, config_name, config_type, default_value, required, description, created_at, updated_at) VALUES
-- React模板配置
(1, 'project_name', '项目名称', 'string', 'my-admin', true, '项目的名称，用于生成package.json等配置', NOW(), NOW()),
(1, 'app_title', '应用标题', 'string', '管理后台', false, '应用显示的标题', NOW(), NOW()),
(1, 'theme_color', '主题色', 'color', '#1890ff', false, '应用的主题色彩', NOW(), NOW()),
(1, 'enable_auth', '启用认证', 'boolean', 'true', false, '是否启用用户认证功能', NOW(), NOW()),

-- Golang模板配置
(2, 'project_name', '项目名称', 'string', 'my-api', true, '项目的模块名称', NOW(), NOW()),
(2, 'server_port', '服务端口', 'number', '8080', false, 'API服务监听端口', NOW(), NOW()),
(2, 'db_host', '数据库地址', 'string', 'localhost', true, '数据库连接地址', NOW(), NOW()),
(2, 'db_port', '数据库端口', 'number', '3306', false, '数据库连接端口', NOW(), NOW()),
(2, 'db_name', '数据库名', 'string', 'mydb', true, '数据库名称', NOW(), NOW()),
(2, 'db_user', '数据库用户', 'string', 'root', true, '数据库用户名', NOW(), NOW()),

-- Vue3模板配置
(3, 'project_name', '项目名称', 'string', 'my-vue-app', true, '项目的名称', NOW(), NOW()),
(3, 'app_title', '应用标题', 'string', '电商管理系统', false, '应用显示的标题', NOW(), NOW()),
(3, 'api_base_url', 'API基础地址', 'string', '/api', false, 'API接口的基础路径', NOW(), NOW()),
(3, 'enable_mock', '启用Mock', 'boolean', 'false', false, '是否启用Mock数据', NOW(), NOW());