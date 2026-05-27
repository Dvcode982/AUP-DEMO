# AUP 爱邮坪 - 校园社区论坛平台

一个面向大学校园的综合性社交论坛平台，支持帖子发布、智能主题推荐、失物招领、即时消息、AI 助手等功能。

## 技术栈

### 前端

| 技术                        | 说明                    |
| --------------------------- | ----------------------- |
| **Next.js 15**              | React 全栈框架          |
| **TypeScript**              | 类型安全                |
| **Tailwind CSS 3**          | 原子化 CSS 框架         |
| **shadcn/ui**               | 基于 Radix UI 的组件库  |
| **Redux Toolkit**           | 全局状态管理            |
| **next-themes**             | 深色/浅色主题切换       |
| **lucide-react**            | 图标库                  |
| **emoji-mart**              | Emoji 表情选择器        |
| **react-hot-toast**         | 轻量级 Toast 通知       |
| **react-calendar**          | 日历日期选择组件        |

### 后端

| 技术              | 说明                         |
| ----------------- | ---------------------------- |
| **Express.js**    | Node.js Web 应用框架         |
| **SQLite**        | 嵌入式关系型数据库           |
| **bcrypt**        | 密码哈希加密                 |
| **jsonwebtoken**  | JWT 认证令牌管理             |
| **body-parser**   | 请求体解析，支持 50MB 上限   |
| **cors**          | 跨域请求处理                 |
| **dotenv**        | 环境变量管理                 |

## 项目结构

```
AUP-DEMO/
├── app/                          # Next.js 前端主目录
│   ├── components/               # 页面级组件
│   │   ├── create-post/          # 发帖表单子组件
│   │   │   ├── CategorySelector.tsx    # 分类选择器
│   │   │   ├── EmojiButton.tsx        # Emoji 按钮
│   │   │   ├── EmojiPicker.tsx        # Emoji 面板
│   │   │   ├── LocationPicker.tsx     # 位置选择器
│   │   │   ├── MediaUpload.tsx        # 媒体上传
│   │   │   ├── PrivacySelector.tsx    # 隐私设置
│   │   │   ├── TagSelector.tsx        # 标签选择器
│   │   │   └── TextInput.tsx          # 文本输入
│   │   ├── messages/             # 消息聊天子组件
│   │   │   ├── ChatWindow.tsx         # 聊天窗口
│   │   │   ├── MessageList.tsx        # 消息列表
│   │   │   ├── UserSearchModal.tsx    # 用户搜索弹窗
│   │   │   └── EmojiButton.tsx        # Emoji 按钮
│   │   ├── AIAssistant.tsx       # AI 助理悬浮窗
│   │   ├── FloatingActionButton.tsx   # 浮动操作按钮
│   │   ├── FontSizeProvider.tsx       # 字体大小全局管理
│   │   ├── LostFoundCard.tsx         # 失物招领卡片
│   │   ├── Post.tsx                    # 帖子卡片
│   │   ├── PostList.tsx               # 帖子列表
│   │   ├── ProtectedRoute.tsx         # 路由守卫
│   │   ├── SearchBar.tsx              # 搜索栏
│   │   ├── Sidebar.tsx                # 侧边导航栏
│   │   ├── SmartRecommendations.tsx   # 智能推荐组件
│   │   ├── TopicCard.tsx              # 主题卡片
│   │   ├── TopicContent.tsx           # 主题内容
│   │   ├── TopicRecommendations.tsx   # 主题推荐
│   │   ├── UserAvatar.tsx             # 用户头像组件
│   │   ├── create-lost-found.tsx      # 失物招领发布页面组件
│   │   └── create-post.tsx            # 帖子发布页面组件
│   ├── contexts/                  # React Context 状态管理
│   │   ├── AuthContext.tsx             # 用户认证上下文
│   │   ├── BackgroundContext.tsx       # 背景主题上下文
│   │   └── LanguageContext.tsx         # 多语言上下文
│   ├── hooks/
│   │   └── useTranslation.ts          # 国际化 Hook
│   ├── i18n/
│   │   └── translations.ts            # 翻译文件
│   ├── login/                     # 登录页面
│   │   ├── page.tsx
│   │   └── server.js
│   ├── register/                  # 注册页面
│   │   ├── page.tsx
│   │   └── server.js
│   ├── post/[id]/                 # 帖子详情页
│   ├── create-post/               # 发帖页面
│   ├── lost-and-found/            # 失物招领列表/详情
│   ├── create-lost-found/         # 失物招领发布页
│   ├── messages/                  # 消息/聊天页面
│   ├── friends/                   # 好友/坪友列表
│   ├── topic-block/               # 主题板块
│   ├── my-profile/                # 个人资料页
│   ├── search/                    # 搜索页面
│   ├── setting/                   # 设置页面
│   ├── feedback/                  # 反馈页面
│   ├── styles/                    # 全局样式
│   ├── globals.css                # Tailwind / CSS 变量
│   ├── layout.tsx                 # 根布局（Provider 嵌套）
│   └── page.tsx                   # 首页
├── components/ui/                 # shadcn/ui 基础组件
│   ├── avatar.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── popover.tsx
│   ├── select.tsx
│   └── textarea.tsx
├── lib/
│   ├── api.ts                     # 前端统一 API 请求封装
│   ├── timeUtils.ts               # 时间格式化工具
│   └── utils.ts                   # 通用工具函数
├── pages/api/                     # Next.js API Routes（可选）
│   ├── ai-assistant.ts
│   └── smart-recommendations.ts
├── store/
│   └── store.js                   # Redux Store 配置
├── server/                        # Express 后端
│   ├── routes/                    # API 路由
│   │   ├── auth.js                     # 认证（注册/登录）
│   │   ├── posts.js                    # 帖子 CRUD
│   │   ├── comments.js                 # 评论管理
│   │   ├── users.js                    # 用户信息
│   │   ├── messages.js                 # 消息聊天
│   │   ├── topicAggregation.js         # 主题智能聚合
│   │   ├── lostAndFound.js             # 失物招领
│   │   └── lostAndFoundComments.js     # 失物招领评论
│   ├── migrations/                # 数据库迁移脚本
│   ├── scripts/                   # 工具脚本
│   ├── db.js                      # 论坛数据库连接
│   ├── db_lost_found.js           # 失物招领独立数据库
│   ├── server.js                  # 服务器入口
│   ├── .env                       # 环境变量
│   └── package.json
├── public/images/                 # 静态图片资源
├── components.json                # shadcn/ui 配置
├── next.config.mjs                # Next.js 配置
├── tailwind.config.ts             # Tailwind 配置
├── tsconfig.json                  # TypeScript 配置
├── package.json                   # 前端依赖
└── postcss.config.mjs             # PostCSS 配置
```

## 核心功能

### 1. 用户认证系统

- **注册/登录**：邮箱 + 密码，密码经 bcrypt 哈希加密存储
- **JWT 令牌认证**：前端通过 `Authorization: Bearer <token>` 请求头传递
- **路由保护**：`ProtectedRoute` 组件拦截未登录访问
- **用户资料**：支持昵称、头像、年级、院系、个人简介等字段
- **跨标签页同步**：监听 `localStorage` 变更，自动同步登录/登出状态

### 2. 论坛帖子系统

- **发布帖子**：富文本内容 + 多图片上传 + 分类 + 标签 + 隐私设置 + 位置信息
- **帖子展示**：自适应网格布局（1~5 列），响应式卡片
- **帖子详情**：独立详情页，支持评论、点赞、分享
- **评论系统**：帖子评论与失物招领评论分离，通过 `post_type` 字段区分
- **搜索过滤**：按关键词、分类、标签搜索帖子

### 3. 智能主题推荐

- **用户行为追踪**：记录浏览(view)、点赞(like)、评论(comment)、分享(share)、创建(create)等行为
- **权重评分算法**：不同操作类型赋予不同权重，计算主题/标签相关性
- **智能聚合**：自动聚合新闻/通知/讨论等不同类别的帖子
- **主题板块**：预设学术交流、资源分享、竞赛交流、校园生活、校园杂谈、技术交流、表白墙、就业兼职等多个主题

### 4. 失物招领系统

- **独立数据库**：`lost_found_database.sqlite` 独立于论坛数据库
- **双类型支持**：寻物启事（Lost）和招领启事（Found），视觉上红色/绿色区分
- **完整表单**：物品名称、分类、描述、时间地点、联系方式、酬谢、图片上传（最多 6 张）
- **状态管理**：已归还/已找到标记、时间记录
- **搜索筛选**：按类型、状态、时间筛选，网格/列表双视图
- **草稿保存**：自动保存用户输入

### 5. 即时消息系统

- **对话列表**：展示所有聊天对象，按最新消息排序
- **文本消息**：实时收发文字消息
- **图片消息**：支持粘贴/上传图片，客户端 Canvas 智能压缩（多级压缩策略）
- **上传进度**：实时显示 0-100% 上传进度
- **已读状态**：单条消息已读和批量对话已读标记
- **消息菜单**：桌面右键/移动端长按触发上下文菜单
- **消息搜索**：按关键词、类型、时间范围筛选
- **时间智能显示**：相对时间（刚刚/5 分钟前）、今天/昨天分组、消息统计

### 6. AI 助手

- **可拖拽悬浮窗**：浮动聊天窗口，可自由拖动位置
- **智能对话**：支持自然语言交互
- **智能推荐联动**：AI 助手可触发帖子智能推荐，自动切换视图模式

### 7. 个性化与主题

- **深色/浅色模式**：通过 `next-themes` 实现，支持系统跟随
- **自定义背景**：多种主题背景切换（默认、EVA、秋日等）
- **字体大小调整**：通过 `FontSizeProvider` 全局管理，支持小/中/大三级
- **多语言 i18n**：完整的中文（简体）国际化支持

### 8. 设置页面

- 通知设置（论坛通知、邮件通知）
- 语言设置
- 主题与字体设置
- 隐私设置（个人资料可见性、在线状态）
- 消息设置（私信权限）
- 发帖设置（签名档、自动保存草稿）

## 快速开始

### 环境要求

- **Node.js** >= 18.x
- **npm** >= 9.x

### 1. 克隆项目

```bash
git clone https://github.com/Dvcode982/AUP-DEMO.git
cd AUP-DEMO
```

### 2. 安装前端依赖

```bash
npm install
```

### 3. 安装后端依赖

```bash
cd server
npm install
cd ..
```

### 4. 配置环境变量

编辑 `server/.env` 文件：

```
PORT=5000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

### 5. 启动后端服务

```bash
cd server
npm run dev
```

后端服务运行在 `http://localhost:5000`。

### 6. 启动前端开发服务器

在项目根目录下另开一个终端：

```bash
npm run dev
```

前端运行在 `http://localhost:3000`。

### 7. 生成测试数据（可选）

```bash
cd server
npm run generate-posts
```

## API 概览

后端服务运行在 `http://localhost:5000`，主要 API 端点：

| 方法   | 路径                                      | 说明               | 认证 |
| ------ | ----------------------------------------- | ------------------ | ---- |
| POST   | `/register`                               | 用户注册           | 否   |
| POST   | `/login`                                  | 用户登录           | 否   |
| GET    | `/api/posts`                              | 获取帖子列表       | 否   |
| POST   | `/api/posts`                              | 创建帖子           | 是   |
| GET    | `/api/posts/:id`                          | 获取帖子详情       | 否   |
| POST   | `/api/posts/:id/comments`                 | 添加评论           | 是   |
| POST   | `/api/posts/:id/like`                     | 点赞帖子           | 是   |
| POST   | `/api/posts/:id/share`                    | 分享帖子           | 是   |
| GET    | `/api/lost-and-found`                     | 失物招领列表       | 否   |
| POST   | `/api/lost-and-found`                     | 发布失物招领       | 是   |
| PUT    | `/api/lost-and-found/:id/return`          | 标记已归还         | 是   |
| GET    | `/api/messages/conversations`             | 获取对话列表       | 是   |
| GET    | `/api/messages/:chatId`                   | 获取消息记录       | 是   |
| POST   | `/api/messages`                           | 发送消息           | 是   |
| GET    | `/api/topic-recommendations`              | 主题推荐           | 是   |
| GET    | `/api/aggregated-posts`                   | 智能聚合帖子       | 是   |
| GET    | `/api/users`                              | 用户列表           | 否   |
| GET    | `/api/user/profile`                       | 当前用户资料       | 是   |
| PUT    | `/api/user/profile`                       | 更新用户资料       | 是   |

详细 API 文档请参阅 [API.md](./API.md)。

## 数据库

项目使用 SQLite 作为数据库，共有两个数据库文件：

- `server/database.sqlite` — 论坛主数据库（用户、帖子、评论、交互、主题聚合）
- `server/lost_found_database.sqlite` — 失物招领独立数据库

数据库迁移脚本位于 `server/migrations/`，服务启动时自动执行。

## 构建部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

## 更新日志

详细的版本更新记录请参阅 [CHANGELOG.md](./CHANGELOG.md)。

## 许可证

ISC

---

# AUP (AiYouPing) - Campus Community Forum Platform

A comprehensive social forum platform for university campuses, supporting post publishing, smart topic recommendations, lost & found, instant messaging, AI assistant, and more.

## Tech Stack

### Frontend

| Technology              | Description                       |
| ----------------------- | --------------------------------- |
| **Next.js 15**          | React full-stack framework        |
| **TypeScript**          | Type safety                       |
| **Tailwind CSS 3**      | Utility-first CSS framework       |
| **shadcn/ui**           | Component library based on Radix  |
| **Redux Toolkit**       | Global state management           |
| **next-themes**         | Dark/light theme switching        |
| **lucide-react**        | Icon library                      |
| **emoji-mart**          | Emoji picker                      |
| **react-hot-toast**     | Lightweight toast notifications   |
| **react-calendar**      | Calendar date picker              |

### Backend

| Technology         | Description                           |
| ------------------ | ------------------------------------- |
| **Express.js**     | Node.js web application framework     |
| **SQLite**         | Embedded relational database          |
| **bcrypt**         | Password hashing                      |
| **jsonwebtoken**   | JWT authentication token management   |
| **body-parser**    | Request body parsing (50MB cap)       |
| **cors**           | Cross-origin request handling         |
| **dotenv**         | Environment variable management       |

## Project Structure

```
AUP-DEMO/
├── app/                          # Next.js frontend main directory
│   ├── components/               # Page-level components
│   │   ├── create-post/          # Post creation form sub-components
│   │   │   ├── CategorySelector.tsx    # Category selector
│   │   │   ├── EmojiButton.tsx        # Emoji button
│   │   │   ├── EmojiPicker.tsx        # Emoji picker panel
│   │   │   ├── LocationPicker.tsx     # Location picker
│   │   │   ├── MediaUpload.tsx        # Media upload
│   │   │   ├── PrivacySelector.tsx    # Privacy settings
│   │   │   ├── TagSelector.tsx        # Tag selector
│   │   │   └── TextInput.tsx          # Text input
│   │   ├── messages/             # Chat sub-components
│   │   │   ├── ChatWindow.tsx         # Chat window
│   │   │   ├── MessageList.tsx        # Message list
│   │   │   ├── UserSearchModal.tsx    # User search modal
│   │   │   └── EmojiButton.tsx        # Emoji button
│   │   ├── AIAssistant.tsx       # AI assistant floating window
│   │   ├── FloatingActionButton.tsx   # Floating action button
│   │   ├── FontSizeProvider.tsx       # Global font size manager
│   │   ├── LostFoundCard.tsx         # Lost & found card
│   │   ├── Post.tsx                    # Post card
│   │   ├── PostList.tsx               # Post list
│   │   ├── ProtectedRoute.tsx         # Route guard
│   │   ├── SearchBar.tsx              # Search bar
│   │   ├── Sidebar.tsx                # Side navigation bar
│   │   ├── SmartRecommendations.tsx   # Smart recommendations
│   │   ├── TopicCard.tsx              # Topic card
│   │   ├── TopicContent.tsx           # Topic content
│   │   ├── TopicRecommendations.tsx   # Topic recommendations
│   │   ├── UserAvatar.tsx             # User avatar component
│   │   ├── create-lost-found.tsx      # Lost & found creation component
│   │   └── create-post.tsx            # Post creation component
│   ├── contexts/                  # React Context state management
│   │   ├── AuthContext.tsx             # Authentication context
│   │   ├── BackgroundContext.tsx       # Background theme context
│   │   └── LanguageContext.tsx         # i18n context
│   ├── hooks/
│   │   └── useTranslation.ts          # i18n hook
│   ├── i18n/
│   │   └── translations.ts            # Translation files
│   ├── login/                     # Login page
│   ├── register/                  # Register page
│   ├── post/[id]/                 # Post detail page
│   ├── create-post/               # Create post page
│   ├── lost-and-found/            # Lost & found list/detail
│   ├── create-lost-found/         # Lost & found creation page
│   ├── messages/                  # Messages/chat page
│   ├── friends/                   # Friends list
│   ├── topic-block/               # Topic blocks
│   ├── my-profile/                # Profile page
│   ├── search/                    # Search page
│   ├── setting/                   # Settings page
│   ├── feedback/                  # Feedback page
│   ├── styles/                    # Global styles
│   ├── globals.css                # Tailwind / CSS variables
│   ├── layout.tsx                 # Root layout (Provider nesting)
│   └── page.tsx                   # Home page
├── components/ui/                 # shadcn/ui base components
├── lib/
│   ├── api.ts                     # Unified API request wrapper
│   ├── timeUtils.ts               # Time formatting utilities
│   └── utils.ts                   # General utility functions
├── pages/api/                     # Next.js API Routes (optional)
├── store/
│   └── store.js                   # Redux Store configuration
├── server/                        # Express backend
│   ├── routes/                    # API routes
│   │   ├── auth.js                     # Authentication (register/login)
│   │   ├── posts.js                    # Post CRUD
│   │   ├── comments.js                 # Comment management
│   │   ├── users.js                    # User info
│   │   ├── messages.js                 # Chat messages
│   │   ├── topicAggregation.js         # Smart topic aggregation
│   │   ├── lostAndFound.js             # Lost & found
│   │   └── lostAndFoundComments.js     # Lost & found comments
│   ├── migrations/                # Database migration scripts
│   ├── scripts/                   # Utility scripts
│   ├── db.js                      # Forum database connection
│   ├── db_lost_found.js           # Lost & found separate database
│   ├── server.js                  # Server entry point
│   ├── .env                       # Environment variables
│   └── package.json
├── public/images/                 # Static image assets
├── components.json                # shadcn/ui configuration
├── next.config.mjs                # Next.js configuration
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Frontend dependencies
└── postcss.config.mjs             # PostCSS configuration
```

## Core Features

### 1. User Authentication

- **Register/Login**: Email + password with bcrypt hashing
- **JWT Token Auth**: Frontend passes `Authorization: Bearer <token>` header
- **Route Protection**: `ProtectedRoute` component guards unauthenticated access
- **User Profiles**: Nickname, avatar, grade, department, bio, etc.
- **Cross-tab Sync**: Listens for `localStorage` changes to auto-sync login/logout state

### 2. Forum Post System

- **Post Creation**: Rich text content + multi-image upload + category + tags + privacy + location
- **Post Display**: Adaptive grid layout (1~5 columns), responsive cards
- **Post Detail**: Dedicated detail page with comments, likes, shares
- **Comment System**: Post comments separated from lost & found comments via `post_type` field
- **Search & Filter**: Search posts by keyword, category, and tags

### 3. Smart Topic Recommendations

- **User Behavior Tracking**: Records view, like, comment, share, create actions
- **Weighted Scoring Algorithm**: Different action types assigned different weights for relevance scoring
- **Smart Aggregation**: Auto-aggregates posts from different categories (news/notices/discussions)
- **Topic Blocks**: Preset topics including Academic Exchange, Resource Sharing, Competition, Campus Life, Tech Discussion, Confession Wall, Job & Part-time, etc.

### 4. Lost & Found System

- **Separate Database**: `lost_found_database.sqlite` independent from the forum database
- **Dual Type Support**: Lost items (red theme) and Found items (green theme)
- **Complete Form**: Item name, category, description, time/location, contact info, reward, image upload (up to 6)
- **Status Management**: Returned/found marking with timestamps
- **Search & Filter**: Filter by type, status, time; grid/list dual view
- **Draft Saving**: Auto-save user input

### 5. Instant Messaging

- **Conversation List**: All chat contacts sorted by latest message
- **Text Messages**: Real-time text message sending and receiving
- **Image Messages**: Paste/upload images with client-side Canvas smart compression
- **Upload Progress**: Real-time 0-100% progress display
- **Read Status**: Single message and batch conversation read marking
- **Message Menu**: Desktop right-click / mobile long-press context menu
- **Message Search**: Filter by keyword, type, and time range
- **Smart Time Display**: Relative time ("Just now"/"5 min ago"), today/yesterday grouping, message statistics

### 6. AI Assistant

- **Draggable Floating Window**: Freely positionable chat window
- **Smart Conversation**: Natural language interaction support
- **Recommendation Integration**: AI assistant can trigger smart post recommendations and auto-switch view modes

### 7. Personalization & Themes

- **Dark/Light Mode**: Powered by `next-themes` with system preference following
- **Custom Backgrounds**: Multiple theme backgrounds (Default, EVA, Autumn, etc.)
- **Font Size Adjustment**: Global management via `FontSizeProvider` with S/M/L three levels
- **i18n**: Full Chinese (Simplified) internationalization support

### 8. Settings Page

- Notification settings (forum notifications, email notifications)
- Language settings
- Theme & font settings
- Privacy settings (profile visibility, online status)
- Message settings (DM permissions)
- Post settings (signature, auto-save drafts)

## Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

### 1. Clone

```bash
git clone https://github.com/Dvcode982/AUP-DEMO.git
cd AUP-DEMO
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 4. Configure Environment Variables

Edit `server/.env`:

```
PORT=5000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

### 5. Start Backend Server

```bash
cd server
npm run dev
```

The backend runs at `http://localhost:5000`.

### 6. Start Frontend Dev Server

Open another terminal in the project root:

```bash
npm run dev
```

The frontend runs at `http://localhost:3000`.

### 7. Generate Test Data (Optional)

```bash
cd server
npm run generate-posts
```

## API Overview

Backend service runs at `http://localhost:5000`. Key API endpoints:

| Method | Path                                      | Description                  | Auth |
| ------ | ----------------------------------------- | ---------------------------- | ---- |
| POST   | `/register`                               | User registration            | No   |
| POST   | `/login`                                  | User login                   | No   |
| GET    | `/api/posts`                              | Get post list                | No   |
| POST   | `/api/posts`                              | Create post                  | Yes  |
| GET    | `/api/posts/:id`                          | Get post detail              | No   |
| POST   | `/api/posts/:id/comments`                 | Add comment                  | Yes  |
| POST   | `/api/posts/:id/like`                     | Like post                    | Yes  |
| POST   | `/api/posts/:id/share`                    | Share post                   | Yes  |
| GET    | `/api/lost-and-found`                     | Lost & found list            | No   |
| POST   | `/api/lost-and-found`                     | Create lost & found item     | Yes  |
| PUT    | `/api/lost-and-found/:id/return`          | Mark as returned             | Yes  |
| GET    | `/api/messages/conversations`             | Get conversation list        | Yes  |
| GET    | `/api/messages/:chatId`                   | Get message history          | Yes  |
| POST   | `/api/messages`                           | Send message                 | Yes  |
| GET    | `/api/topic-recommendations`              | Topic recommendations        | Yes  |
| GET    | `/api/aggregated-posts`                   | Smart aggregated posts       | Yes  |
| GET    | `/api/users`                              | User list                    | No   |
| GET    | `/api/user/profile`                       | Current user profile         | Yes  |
| PUT    | `/api/user/profile`                       | Update user profile          | Yes  |

For detailed API documentation, see [API.md](./API.md).

## Database

The project uses SQLite with two database files:

- `server/database.sqlite` — Main forum database (users, posts, comments, interactions, topic aggregation)
- `server/lost_found_database.sqlite` — Separate lost & found database

Migration scripts are in `server/migrations/` and run automatically on server startup.

## Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

## License

ISC
