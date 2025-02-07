# 代码结构说明文档

## 项目概述

这是一个基于 Express.js 和 SQLite 构建的后端服务，为爱邮坪社交平台提供 API 支持。主要功能包括用户认证、帖子管理、失物招领和 AI 规划等服务。

## 完整文件结构

```
项目根目录/
├── server/                 # 后端服务目录
│   ├── routes/            # 路由文件目录
│   │   ├── auth.js       # 用户认证相关路由
│   │   ├── posts.js      # 帖子管理相关路由
│   │   ├── lostAndFound.js # 失物招领相关路由
│   │   └── aiPlanner.js  # AI 规划相关路由
│   ├── .env              # 环境变量配置
│   ├── package.json      # 项目配置和依赖
│   └── server.js         # 主服务器文件
├── API.md                 # API 接口文档
└── CODE_EXPLANATION.md    # 代码说明文档（本文件）
```

## 详细文件说明

### 1. 配置文件

#### server/package.json
```json
{
  "name": "avp-server",
  "version": "1.0.0",
  "description": "AVP 爱邮坪后端服务"
  // ...
}
```
- 定义项目基本信息和配置
- 管理项目依赖包
- 配置启动脚本：
  - `npm start`: 生产环境启动
  - `npm run dev`: 开发环境启动（支持热重载）
- 主要依赖包：
  - express: Web 应用框架
  - sqlite3: SQLite 数据库驱动
  - bcrypt: 密码加密
  - jsonwebtoken: JWT 认证
  - body-parser: 请求体解析
  - cors: 跨域资源共享
  - dotenv: 环境变量管理

#### server/.env
```
PORT=5000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```
- 环境变量配置文件
- 包含敏感配置信息
- 不应提交到版本控制系统
- 生产环境需要单独配置

### 2. 核心服务文件

#### server/server.js
主服务器入口文件，包含：

1. 依赖导入
```javascript
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
```

2. 中间件配置
```javascript
app.use(bodyParser.json());
app.use(cors());
```

3. 数据库初始化
```javascript
const db = new sqlite3.Database('./database.sqlite', ...);
```

4. 数据库表结构
- users 表：用户信息
  ```sql
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  ```
- posts 表：帖子内容
  ```sql
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    category TEXT,
    privacy TEXT DEFAULT 'public',
    location TEXT,
    FOREIGN KEY (author_id) REFERENCES users (id)
  )
  ```
- post_tags 表：帖子标签
  ```sql
  CREATE TABLE IF NOT EXISTS post_tags (
    post_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts (id)
  )
  ```
- lost_and_found 表：失物招领
  ```sql
  CREATE TABLE IF NOT EXISTS lost_and_found (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_returned BOOLEAN DEFAULT FALSE,
    returned_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users (id)
  )
  ```
- ai_plans 表：AI 规划记录
  ```sql
  CREATE TABLE IF NOT EXISTS ai_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    plan_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )
  ```

5. JWT 认证中间件
```javascript
const authenticateToken = (req, res, next) => {
  // 验证 token
  // 解析用户信息
  // 注入到请求对象
};
```

### 3. 路由文件

#### server/routes/auth.js
用户认证路由：

1. 注册接口 `/register`
```javascript
app.post('/register', async (req, res) => {
  // 验证输入
  // 检查邮箱
  // 加密密码
  // 创建用户
});
```

2. 登录接口 `/login`
```javascript
app.post('/login', (req, res) => {
  // 验证凭据
  // 生成 token
  // 返回用户信息
});
```

#### server/routes/posts.js
帖子管理路由：

1. 获取帖子列表
```javascript
app.get('/api/posts', async (req, res) => {
  // 查询公开帖子
  // 获取标签信息
  // 返回完整数据
});
```

2. 获取单个帖子
```javascript
app.get('/api/posts/:id', async (req, res) => {
  // 检查权限
  // 获取帖子
  // 获取标签
});
```

3. 创建帖子
```javascript
app.post('/api/posts', authenticateToken, async (req, res) => {
  // 验证内容
  // 创建帖子
  // 添加标签
});
```

#### server/routes/lostAndFound.js
失物招领路由：

1. 获取列表
```javascript
app.get('/api/lost-and-found', async (req, res) => {
  // 查询所有记录
  // 添加标签信息
});
```

2. 标记归还
```javascript
app.put('/api/lost-and-found/:id/return', authenticateToken, async (req, res) => {
  // 验证权限
  // 更新状态
});
```

3. 创建记录
```javascript
app.post('/api/lost-and-found', authenticateToken, async (req, res) => {
  // 验证内容
  // 创建记录
});
```

#### server/routes/aiPlanner.js
AI 规划路由：

1. 发送规划请求
```javascript
app.post('/api/ai-planner', authenticateToken, async (req, res) => {
  // 处理用户消息
  // 生成 AI 响应
  // 保存记录
});
```

2. 获取历史记录
```javascript
app.get('/api/ai-planner/history', authenticateToken, async (req, res) => {
  // 查询用户历史
  // 格式化响应
});
```

### 4. 文档文件

#### API.md
- 完整的 API 接口文档
- 包含所有接口的详细说明
- 请求和响应格式
- 状态码说明

#### CODE_EXPLANATION.md（本文件）
- 代码结构说明
- 文件功能解释
- 开发部署指南
- 安全特性说明

## 安全特性

1. 密码安全
   - 使用 bcrypt 加密存储
   - 不存储明文密码
   - 密码加密强度因子：10

2. 身份认证
   - 基于 JWT 的认证机制
   - token 有效期 24 小时
   - 支持 token 刷新（待实现）

3. 数据库安全
   - 使用参数化查询防止 SQL 注入
   - 事务保证数据一致性
   - 外键约束保证数据完整性

4. 错误处理
   - 统一的错误响应格式
   - 生产环境隐藏敏感错误信息
   - 详细的错误日志

5. 访问控制
   - 基于角色的权限控制（待实现）
   - 资源访问验证
   - API 访问频率限制（待实现）

## 开发和部署

### 开发环境设置
```bash
# 克隆项目
git clone [repository-url]

# 安装依赖
cd server
npm install

# 启动开发服务器
npm run dev
```

### 生产环境部署
```bash
# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env
vim .env  # 修改配置

# 启动服务器
npm start
```

### 部署检查清单
1. 环境变量配置
   - 修改 JWT_SECRET
   - 设置 NODE_ENV=production
   - 配置正确的 PORT

2. 数据库配置
   - 配置数据库路径
   - 设置备份策略
   - 配置访问权限

3. 安全配置
   - 启用 HTTPS
   - 配置防火墙
   - 设置访问限制

4. 进程管理
   - 使用 PM2 管理进程
   - 配置自动重启
   - 设置日志轮转

### 监控和维护
1. 日志管理
   - 访问日志
   - 错误日志
   - 性能监控

2. 备份策略
   - 数据库定期备份
   - 配置文件备份
   - 日志备份

3. 更新维护
   - 依赖包更新
   - 安全补丁
   - 功能迭代 