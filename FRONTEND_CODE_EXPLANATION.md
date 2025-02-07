# 前端代码结构说明文档

## 项目概述

这是一个基于 Next.js 和 TypeScript 构建的前端项目，使用了 Tailwind CSS 进行样式设计。项目采用了现代化的前端技术栈，实现了一个功能完整的社交平台界面。

## 完整文件结构

```
AUP-DEMO/
├── app/                    # 主应用目录
│   ├── page.tsx           # 首页组件
│   ├── layout.tsx         # 全局布局组件
│   ├── register/         # 注册相关页面
│   ├── login/            # 登录相关页面
│   ├── post/             # 帖子相关页面
│   ├── lost-and-found/   # 失物招领页面
│   ├── ai-planner/       # AI 规划页面
│   └── components/       # 页面级组件
├── components/            # 全局共享组件
├── lib/                   # 工具函数和配置
├── public/               # 静态资源文件
├── .next/                # Next.js 构建文件
├── node_modules/         # 依赖包
├── .eslintrc.json       # ESLint 配置
├── .gitignore           # Git 忽略配置
├── next.config.mjs      # Next.js 配置
├── package.json         # 项目配置和依赖
├── postcss.config.mjs   # PostCSS 配置
├── tailwind.config.ts   # Tailwind 配置
├── tsconfig.json        # TypeScript 配置
└── next-env.d.ts        # Next.js 类型声明
```

## 详细文件说明

### 1. 配置文件

#### package.json
```json
{
  "name": "aup-demo",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```
- 定义项目信息和脚本
- 管理项目依赖
- 主要依赖包：
  - next: React 框架
  - react: UI 库
  - tailwindcss: 样式框架
  - shadcn/ui: UI 组件库
  - lucide-react: 图标库

#### next.config.mjs
```javascript
const nextConfig = {
  images: {
    domains: [
      'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      '*.public.blob.vercel-storage.com'
    ]
  }
};
```
- Next.js 框架配置
- 图片域名白名单
- Webpack 配置优化

#### tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 自定义主题配置
    }
  },
  plugins: []
};
```
- Tailwind CSS 配置
- 主题定制
- 插件配置

### 2. 核心页面组件

#### app/page.tsx
首页组件，包含：
- 帖子列表展示
- 搜索栏
- 侧边栏导航
- 浮动操作按钮

#### app/register/page.tsx
注册页面，实现：
- 用户注册表单
- 输入验证
- 错误提示
- 注册成功跳转

#### app/login/page.tsx
登录页面，实现：
- 用户登录表单
- 密码加密
- Token 存储
- 登录状态管理

#### app/post/[id]/page.tsx
帖子详情页，包含：
- 帖子内容展示
- 评论功能
- 标签展示
- 作者信息

#### app/lost-and-found/page.tsx
失物招领页面，实现：
- 失物招领列表
- 发布功能
- 状态标记
- 归还确认

#### app/ai-planner/page.tsx
AI 规划助手页面，包含：
- 对话界面
- 日程展示
- 历史记录
- 日历组件

### 3. 共享组件

#### components/Post.tsx
帖子组件，实现：
- 内容展示
- 图片处理
- 标签渲染
- 交互功能

#### components/Sidebar.tsx
侧边栏组件，包含：
- 导航菜单
- 用户信息
- 主题切换
- 登录状态

#### components/SearchBar.tsx
搜索组件，实现：
- 搜索输入
- 实时建议
- 结果过滤
- 历史记录

#### components/FloatingActionButton.tsx
浮动按钮组件，提供：
- 快速发帖
- 页面导航
- 动画效果

### 4. 工具和配置

#### lib/utils.ts
工具函数集合：
- API 请求封装
- 日期格式化
- 数据处理
- 验证函数

#### lib/hooks/
自定义 React Hooks：
- useAuth: 认证状态管理
- useTheme: 主题管理
- usePost: 帖子数据处理
- useAI: AI 对话管理

### 5. 样式设计

项目使用 Tailwind CSS 进行样式设计：
- 响应式布局
- 深色模式支持
- 自定义主题
- 动画效果

### 6. 状态管理

使用 React 状态管理方案：
- Context API
- Custom Hooks
- Local Storage
- JWT 认证

## 开发特性

1. 性能优化
   - 图片优化
   - 组件懒加载
   - 路由预加载
   - 缓存策略

2. 用户体验
   - 响应式设计
   - 加载状态
   - 错误处理
   - 表单验证

3. 可访问性
   - ARIA 标签
   - 键盘导航
   - 屏幕阅读器支持
   - 颜色对比度

4. 开发体验
   - TypeScript 类型检查
   - ESLint 代码规范
   - 热重载
   - 开发工具集成

## 开发指南

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 代码检查
npm run lint

# 构建生产版本
npm run build
```

### 项目结构规范
1. 组件开发
   - 一个文件一个组件
   - 使用 TypeScript
   - 编写注释
   - 添加类型定义

2. 样式管理
   - 使用 Tailwind 类名
   - 避免内联样式
   - 保持一致性
   - 响应式设计

3. 状态管理
   - 合理使用 Hooks
   - 避免状态提升
   - 缓存优化
   - 错误边界

4. 代码质量
   - 遵循 ESLint 规则
   - 编写测试
   - 代码审查
   - 性能监控 