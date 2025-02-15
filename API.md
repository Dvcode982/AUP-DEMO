# AVP 爱邮坪 API 文档

## 基础信息

- 基础URL: `http://localhost:5000`
- 所有请求和响应均使用 JSON 格式
- 所有需要认证的接口都需要在请求头中包含 token（待实现）

## 用户认证 API

### 用户注册

**请求**
- 方法: `POST`
- 路径: `/register`
- Content-Type: `application/json`

**请求参数**
```json
{
  "email": "string",     // 用户邮箱
  "password": "string",  // 用户密码
  "confirmPassword": "string" // 确认密码
}
```

**响应**
- 成功 (201)
```json
{
  "message": "User registered successfully",
  "userId": "number"
}
```
- 失败 (400)
```json
{
  "error": "string" // 错误信息
}
```

### 用户登录

**请求**
- 方法: `POST`
- 路径: `/login`
- Content-Type: `application/json`

**请求参数**
```json
{
  "email": "string",    // 用户邮箱
  "password": "string"  // 用户密码
}
```

**响应**
- 成功 (200)
```json
{
  "message": "Login successful",
  "userId": "number"
}
```
- 失败 (401)
```json
{
  "error": "Invalid email or password"
}
```

## 帖子 API

### 获取帖子列表

**请求**
- 方法: `GET`
- 路径: `/api/posts`

**响应**
- 成功 (200)
```json
[
  {
    "id": "number",
    "author": "string",
    "avatar": "string",
    "content": "string",
    "image": "string",
    "time": "string",
    "tags": ["string"]
  }
]
```

### 获取单个帖子

**请求**
- 方法: `GET`
- 路径: `/api/posts/{id}`

**响应**
- 成功 (200)
```json
{
  "id": "number",
  "author": "string",
  "avatar": "string",
  "content": "string",
  "image": "string",
  "time": "string",
  "tags": ["string"]
}
```

### 创建帖子

**请求**
- 方法: `POST`
- 路径: `/api/posts`
- Content-Type: `application/json`

**请求参数**
```json
{
  "content": "string",      // 帖子内容
  "media": ["string"],      // 媒体文件 URL 数组
  "category": "string",     // 帖子分类
  "privacy": "string",      // 隐私设置 (public/private)
  "location": "string",     // 位置信息
  "tags": ["string"]        // 标签数组
}
```

**响应**
- 成功 (201)
```json
{
  "id": "number",
  "message": "Post created successfully"
}
```

## 失物招领 API

### 获取失物招领列表

**请求**
- 方法: `GET`
- 路径: `/api/lost-and-found`

**响应**
- 成功 (200)
```json
[
  {
    "id": "number",
    "author": "string",
    "avatar": "string",
    "content": "string",
    "time": "string",
    "tags": ["string"],
    "isLostAndFound": true,
    "isReturned": "boolean",
    "returnedTime": "string"
  }
]
```

### 标记物品已找到/已归还

**请求**
- 方法: `PUT`
- 路径: `/api/lost-and-found/{id}/return`

**响应**
- 成功 (200)
```json
{
  "message": "Item marked as returned",
  "returnedTime": "string"
}
```

## AI 规划师 API

### 发送规划请求

**请求**
- 方法: `POST`
- 路径: `/api/ai-planner`
- Content-Type: `application/json`

**请求参数**
```json
{
  "message": "string",     // 用户输入的消息
  "date": "string"        // 可选，规划的日期
}
```

**响应**
- 成功 (200)
```json
{
  "response": "string",    // AI 回复的消息
  "suggestions": [         // 可选，AI 的建议列表
    {
      "time": "string",
      "activity": "string"
    }
  ]
}
```

## 错误响应

所有 API 在发生错误时会返回以下格式的响应：

```json
{
  "error": "string",       // 错误信息
  "code": "string",        // 错误代码
  "details": "object"      // 可选，详细错误信息
}
```

## 状态码说明

- 200: 请求成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未授权
- 403: 禁止访问
- 404: 资源不存在
- 500: 服务器内部错误 