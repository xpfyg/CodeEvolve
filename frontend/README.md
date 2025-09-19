# CodeEvolve Frontend

这是 CodeEvolve AI 智能代码生成平台的前端应用，使用 React + TypeScript + TailwindCSS 构建。

## 技术栈

- **React 19** - 前端框架
- **TypeScript** - 类型安全
- **TailwindCSS** - 样式框架
- **Vite** - 构建工具
- **Axios** - HTTP 客户端

## 项目结构

```
src/
├── api/                        # API 服务层
│   └── index.ts                # API 接口封装
├── components/                 # 可复用组件
│   ├── CodeGenerationForm.tsx  # 代码生成表单
│   ├── CodeAnalysisForm.tsx    # 代码分析表单
│   ├── TestGenerationForm.tsx  # 测试生成表单
│   ├── ResultsDisplay.tsx      # 结果展示组件
│   ├── InputBox.tsx            # 需求输入组件 (旧版)
│   ├── IssueCard.tsx           # Issue 卡片组件 (旧版)
│   └── IssueList.tsx           # Issue 列表组件 (旧版)
├── types/                      # TypeScript 类型定义
│   └── index.ts                # 接口类型定义
├── App.tsx                     # 主应用组件
├── index.css                   # 全局样式
└── main.tsx                    # 应用入口
```

## 功能特性

### 1. AI 代码生成 🚀
- 基于自然语言需求描述生成代码
- 支持指定目标文件和自定义分支名称
- 自动创建 Git 分支并提交更改
- 实时显示生成结果和修改的文件列表

### 2. 代码质量分析 🔍
- 分析代码复杂度和可维护性
- 检测代码异味和潜在问题
- 提供具体的改进建议
- 支持多种编程语言

### 3. 自动测试生成 🧪
- 为源代码自动生成单元测试
- 支持多种测试框架
- 智能分析函数和类结构
- 生成边界条件和异常测试

### 4. 需求管理 📋 (传统模式)
- Issue 创建和管理
- 分支创建和 PR 管理
- 实时状态跟踪
- 预览功能

## API 接口

### AI 代码生成服务 (主要功能)

```typescript
// 健康检查
GET /health

// 代码生成
POST /generate-code
Body: {
  "requirement": "功能需求描述",
  "repo_path": "/path/to/project",
  "target_files": ["file1.py", "file2.py"], // 可选
  "branch_name": "feature-name" // 可选
}

// 代码分析
POST /api/v1/analyze-code
Body: {
  "repo_path": "/path/to/project",
  "file_path": "src/main.py"
}

// 测试生成
POST /api/v1/generate-tests
Body: {
  "repo_path": "/path/to/project",
  "file_path": "src/utils.py",
  "test_file_path": "tests/test_utils.py" // 可选
}

// 仓库管理
GET /repos/{repo_path}/branches
GET /repos/{repo_path}/files?extension=py
```

### 传统 Issue 管理 API

```typescript
// 创建 Issue
POST /issues
Body: { "title": string, "description": string }

// 获取 Issue 列表
GET /issues

// 分支操作
POST /issues/{id}/branch
POST /issues/{id}/pr
POST /issues/{id}/merge
GET /issues/{id}/preview
```

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器 (http://localhost:5173)
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## 配置说明

### API 服务地址
- **AI 服务**: `http://localhost:8000` (主要功能)
- **传统 API**: `http://localhost:8080/api` (Issue 管理)

如需修改，请编辑 `src/api/index.ts` 中的 `API_BASE_URL` 常量。

### Mock 数据
当后端 API 不可用时，应用会自动使用 Mock 数据进行演示，包含：
- 模拟的代码生成响应
- 模拟的代码分析结果
- 模拟的测试生成内容
- 完整的操作流程演示

## 界面设计

### Tab 导航
- **代码生成** 🚀: AI 驱动的代码生成功能
- **代码分析** 🔍: 代码质量分析和建议
- **测试生成** 🧪: 自动化测试用例生成
- **需求管理** 📋: 传统的 Issue 管理功能

### 样式设计
- **设计理念**: 简洁、现代、直观
- **颜色方案**:
  - 代码生成: 绿色 (green-600)
  - 代码分析: 蓝色 (blue-600)
  - 测试生成: 紫色 (purple-600)
  - 成功状态: 绿色
  - 错误状态: 红色
- **响应式设计**: 支持不同屏幕尺寸
- **交互反馈**: Loading 状态、Hover 效果、禁用状态

## 浏览器兼容性

支持所有现代浏览器：
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 使用说明

1. **代码生成**: 输入需求描述和仓库路径，点击"开始生成代码"
2. **代码分析**: 输入仓库路径和文件路径，点击"开始分析"
3. **测试生成**: 输入源文件路径，点击"生成测试"
4. **查看结果**: 在结果区域查看操作结果和详细信息
