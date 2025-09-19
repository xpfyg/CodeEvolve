# CodeEvolve Frontend

这是 CodeEvolve 智能代码生成平台的前端应用，使用 React + TypeScript + TailwindCSS 构建。

## 技术栈

- **React 19** - 前端框架
- **TypeScript** - 类型安全
- **TailwindCSS** - 样式框架
- **Vite** - 构建工具
- **Axios** - HTTP 客户端

## 项目结构

```
src/
├── api/              # API 服务层
│   └── index.ts      # API 接口封装
├── components/       # 可复用组件
│   ├── InputBox.tsx  # 需求输入组件
│   ├── IssueCard.tsx # Issue 卡片组件
│   └── IssueList.tsx # Issue 列表组件
├── types/            # TypeScript 类型定义
│   └── index.ts      # 接口类型定义
├── App.tsx           # 主应用组件
├── index.css         # 全局样式
└── main.tsx          # 应用入口
```

## 功能特性

### 1. 需求输入区
- 顶部输入表单（标题 + 描述）
- 实时表单验证
- 支持创建新的 Issue

### 2. Issue 列表区
- 展示所有 Issue 的卡片列表
- 实时状态更新
- 支持多种操作：
  - **创建分支** (黄色按钮)
  - **预览** (蓝色按钮)
  - **提交 PR** (绿色按钮)
  - **合并** (紫色按钮)

### 3. 状态管理
- Issue 状态：open、in_progress、completed、closed
- PR 状态：draft、open、merged、closed
- 智能按钮状态控制

## API 接口

支持以下后端 API：

```typescript
// 创建 Issue
POST /api/issues
Body: { "title": string, "description": string }

// 获取 Issue 列表
GET /api/issues

// 创建分支
POST /api/issues/{id}/branch

// 提交 PR
POST /api/issues/{id}/pr

// 合并 PR
POST /api/issues/{id}/merge

// 获取预览
GET /api/issues/{id}/preview
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

## Mock 数据

当后端 API 不可用时，应用会自动使用 Mock 数据，包含：
- 示例 Issue 列表
- 模拟 API 响应
- 完整的操作流程演示

## 样式设计

- **设计理念**：简洁、卡片化、现代感
- **颜色方案**：
  - 分支操作：黄色 (yellow-500)
  - 预览功能：蓝色 (blue-500)
  - PR 提交：绿色 (green-500)
  - 合并操作：紫色 (purple-500)
- **响应式设计**：支持不同屏幕尺寸
- **交互反馈**：hover 效果、loading 状态、禁用状态

## 部署配置

默认后端 API 地址：`http://localhost:8080/api`

如需修改，请编辑 `src/api/index.ts` 中的 `API_BASE_URL` 常量。

## 浏览器兼容性

支持所有现代浏览器：
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
