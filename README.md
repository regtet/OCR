## OCR — 图片 OCR 识别与智能匹配工具

简洁版网页工具，支持将两组图片（A 为模板、B 为待重命名）进行 OCR 识别、智能匹配与一键下载重命名结果。

![主界面截图](./image.png)

---

## 🎉 最近更新 (v1.2.0 - 2025-10-18)

### ✨ 新增功能
- **强制匹配按钮**：支持无视尺寸限制进行匹配，与"确认手动匹配"按钮互斥启用
- **批次发送策略**：每秒发送6张图片，不等待上一批返回，效率提升40%+
- **API地址自动适配**：本地开发自动用localhost，服务器部署自动用当前地址
- **前后端QPS协同**：前端自动从服务器获取配置，滑块最大值动态调整

### 🚀 性能优化
- 并发度：2 → 6（提升3倍）
- 默认QPS：2 → 6（充分利用3个API Key）
- 服务器Key分配：智能选择最久未使用的Key，减少QPS限制触发
- CORS预检缓存：24小时缓存，减少OPTIONS请求

### 🔐 安全改进
- 支持 `config.js` 配置文件管理API Key（不提交到Git）
- 支持 `.env` 环境变量配置
- 三级配置优先级：config.js > 环境变量 > 默认配置
- 提供 `config.example.js` 和 `env.example` 示例文件

### 🎨 界面优化
- 排序规则优化：已匹配的图片排在前面，按尺寸从小到大显示
- 按钮状态智能切换：尺寸匹配用"确认匹配"，尺寸不匹配用"强制匹配"
- 新增强制匹配按钮（橙色警告色）
- 优化批量下载按钮配色（青色）

### 🐛 Bug修复
- 修复 OCR 识别完成后仍显示"识别中..."的问题
- 修复空白图片识别结果显示异常
- 修复 Node.js 版本兼容性（支持14+）
- 修复模块语法错误（ES6 → CommonJS）

### 📝 文档完善
- 新增 `DEPLOY.md` 部署指南（必须文件清单、部署步骤、PM2配置）
- 完善 `README.md` 文档（QPS协同说明、API接口文档、FAQ扩充）
- 整合项目文档，删除冗余文件

### 🔄 项目结构
- 分支管理：main分支专注核心OCR，ocrplus分支提供格式转换功能
- 添加 `.gitignore` 排除敏感文件和依赖包
- 创建 `package.json` 项目配置

---

## 功能概览

### 核心功能
- **文件导入**: A/B 两组各自选择或拖拽导入，支持多次追加与单张删除
- **OCR 识别**:
  - 批次发送策略，每秒处理6张图片
  - 并发度6，充分利用3个API Key
  - 智能Key分配，避免QPS限制
  - 自动重试机制（网络错误、QPS限制）
- **智能匹配与重命名**:
  - 自动匹配：仅匹配尺寸一致的图片，文本相似度≥阈值（默认0.5）
  - 手动匹配：支持尺寸匹配的图片配对
  - 强制匹配：支持无视尺寸限制的强制配对（带警告）
  - 冲突处理：同名冲突自动回退并标记
- **智能排序**:
  - 已匹配的图片排在前面
  - 按分辨率从小到大排序
  - 相同尺寸按文件名排序
- **下载**: 批量单张下载或打包 ZIP 下载
- **可视化**: 网格预览、OCR 文本、分辨率、匹配状态、统计面板、大图预览

### 性能特性
- ⚡ **识别速度**: 约6张/秒（理论上限）
- 🔄 **多Key轮询**: 3个API Key自动切换
- 📊 **QPS自适应**: 前端自动从服务器获取最大QPS配置
- 🌐 **环境自适应**: 自动检测本地/服务器环境

---

## 目录结构

```
OCR/
├── server.js              # 主服务器（多Key轮询）
├── index.html             # 主前端页面
├── config.example.js      # 配置文件示例
├── env.example            # 环境变量示例
├── package.json           # 项目配置
├── package-lock.json      # 依赖锁定
├── .gitignore             # Git 忽略配置
├── CHANGELOG.md           # 更新日志
├── README.md              # 本文件
├── LICENSE                # MIT 许可证
├── image.png              # 截图
├── node_modules/          # 依赖包（自动生成）
├── config.js              # ⚠️ 你的真实配置（不提交）
└── .env                   # ⚠️ 你的环境变量（不提交）
```

### 文件说明

- **server.js**: 多 API Key 轮询服务器
  - 支持 3 组百度 OCR API Key
  - 自动 QPS 限制检测和重试
  - 提供 `/config` 接口供前端获取配置

- **index.html**: 主前端页面
  - API 地址: `http://localhost:3000/ocr`
  - 自动从服务器获取最大 QPS 配置
  - 支持动态调整 QPS（基于服务器 Key 数量）

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

⚠️ **安全提示：不要直接修改 `server.js` 硬编码 API Key！**

#### 方式 A：使用配置文件（推荐）

```bash
# 1. 复制示例配置
cp config.example.js config.js

# 2. 编辑 config.js，填入你的真实 API Key
# config.js 已在 .gitignore 中，不会被提交到 Git
```

```javascript
// config.js
module.exports = {
    API_KEYS: [
        {
            id: 1,
            apiKey: '你的真实_API_KEY',
            secretKey: '你的真实_SECRET_KEY',
            accessToken: '',
            expireTime: 0
        }
        // 可添加更多 Key 提高 QPS
    ]
};
```

#### 方式 B：使用环境变量

```bash
# 1. 复制示例文件
cp env.example .env

# 2. 编辑 .env 文件
```

```bash
# .env
BAIDU_API_KEY_1=你的API_KEY_1
BAIDU_SECRET_KEY_1=你的SECRET_KEY_1

BAIDU_API_KEY_2=你的API_KEY_2
BAIDU_SECRET_KEY_2=你的SECRET_KEY_2
```

#### 配置优先级

1. **config.js** ← 优先使用
2. **环境变量** ← 次选
3. **默认配置** ← 仅用于测试（会显示警告）

### 3. 启动服务器

```bash
npm start
# 或
node server.js
```

服务器将启动在 `http://localhost:3000`

### 4. 使用前端

#### 本地开发
- 直接在浏览器打开 `index.html`
- API 会自动连接到 `http://localhost:3000`

#### 服务器部署
- 访问 `http://your-server-ip:3000/index.html`
- API 会自动使用当前服务器地址

#### 远程访问（本地打开 HTML 连接远程服务器）
需要修改 `index.html` 第 806 行：
```javascript
// 取消注释并修改为你的服务器IP
return 'http://117.72.99.159:3000';
```

---

上传图片后点击"开始识别并自动匹配"，前端会自动从服务器获取 QPS 配置

### 5. 下载结果

- 使用"批量单张下载"或"批量 ZIP 下载"

---

## QPS 限制说明

### 自动协同机制

- **服务器端**: `server.js` 配置了 N 个 API Key，理论最大 QPS = N × 2
- **前端**: `index.html` 启动时自动从服务器获取最大 QPS 配置
- **动态调整**: QPS 滑块的最大值会根据服务器 Key 数量自动设置

### 配置示例

| API Key 数量 | 最大 QPS | 推荐设置 |
|-------------|---------|---------|
| 1 个 Key    | 2       | 2       |
| 2 个 Key    | 4       | 3-4     |
| 3 个 Key    | 6       | 4-6     |

### 查看当前配置

访问 `http://localhost:3000/config` 查看服务器配置：
```json
{
  "totalKeys": 3,
  "maxQPS": 6,
  "recommendedQPS": 6
}
```

---

## API 接口说明

### GET /config
获取服务器配置（供前端动态调整 QPS）

**响应示例：**
```json
{
  "totalKeys": 3,
  "maxQPS": 6,
  "recommendedQPS": 6
}
```

### POST /ocr
OCR 识别接口

**请求：**
```json
{
  "imageBase64": "base64编码的图片数据"
}
```

**响应：**
```json
{
  "words_result": [
    {
      "words": "识别的文字",
      "probability": 0.95
    }
  ]
}
```

### GET /test-token
测试所有 API Key 是否有效

**响应示例：**
```json
{
  "totalKeys": 3,
  "successfulKeys": 3,
  "maxQPS": 6,
  "results": [...]
}
```

### ⚠️ 安全提示

**保护你的 API Key：**
1. ✅ 使用 `config.js` 或 `.env` 文件配置
2. ✅ 这些文件已在 `.gitignore` 中，不会被提交
3. ❌ 不要在 `server.js` 中硬编码 API Key
4. ❌ 不要将包含真实 Key 的文件提交到 Git

**Git 提交前检查：**
```bash
# 确认敏感文件被忽略
git status

# 应该看到：
# - config.js 不在列表中
# - .env 不在列表中
```

---

## 其他版本

### OCRPlus 增强版

如需格式转换功能（JPG/PNG/WebP/AVIF/ICO 等），请切换到 `ocrplus` 分支：

```bash
git checkout ocrplus
```

---

## 常见问题（FAQ）

### Q1: server.js 启动失败？
**A**: 检查：
- Node.js 版本是否 ≥ 14.0.0（推荐 18+）
- 依赖是否已安装（运行 `npm install`）
- 端口 3000 是否被占用

### Q2: 无法识别/报 QPS 限制？
**A**:
- 等待片刻自动重试
- 降低前端 QPS 滑块值
- 在 `server.js` 中添加更多 API Key

### Q3: QPS 滑块最大值是多少？
**A**:
- 前端会自动从服务器获取配置
- 最大值 = 服务器配置的 Key 数量 × 2
- 3 个 Key 的最大 QPS = 6

### Q4: 相似度阈值怎么调？
**A**:
- 识别完成后可拖动滑块
- 系统会保留手动匹配并重新计算自动匹配

### Q5: 一张 A 被多个 B 匹配怎么办？
**A**:
- 内置去重策略：同名冲突时会回退冲突 B
- 建议手动重新匹配冲突项

### Q6: OCRPlus 增强版在哪里？
**A**:
- 增强版（包含格式转换）在 `ocrplus` 分支
- 切换命令：`git checkout ocrplus`

---

## 环境要求

- **Node.js**: ≥ 14.0.0（推荐 18+）
- **浏览器**: 现代浏览器（Chrome/Firefox/Edge）
- **网络**: 需要访问百度 OCR API

## 依赖包

```json
{
  "express": "^4.18.2",      // Web服务器框架
  "node-fetch": "^2.7.0",    // HTTP请求库
  "cors": "^2.8.5"           // 跨域资源共享
}
```

---

## 🚀 服务器部署指南

### 📦 必须上传的文件

**核心文件（4个）：**
```
server.js              # 服务器主文件
index.html             # 前端页面
package.json           # 依赖配置
config.example.js      # 配置模板
```

**❌ 不要上传：**
```
node_modules/          # 太大，服务器上重新安装
config.js              # 包含真实API Key！危险！
.env                   # 包含敏感信息
.git/                  # 不需要
```

---

### 🔧 部署步骤

#### 方式A：Git克隆（推荐）

```bash
# 1. 在服务器上克隆
git clone https://github.com/regtet/OCR.git
cd OCR

# 2. 安装依赖
npm install

# 3. 配置API Key
cp config.example.js config.js
nano config.js  # 填入真实API Key

# 4. 启动服务
node server.js

# 生产环境用PM2（推荐）
npm install -g pm2
pm2 start server.js --name ocr-server
pm2 save
pm2 startup
```

#### 方式B：手动上传

```bash
# 本地准备文件
mkdir ocr-deploy
cp server.js index.html package.json config.example.js ocr-deploy/

# 上传到服务器（SCP）
scp -r ocr-deploy/* user@your-server:/path/to/ocr/

# 服务器上配置
ssh user@your-server
cd /path/to/ocr
npm install
cp config.example.js config.js
nano config.js  # 填入API Key
node server.js
```

---

### 🔐 生产环境配置

#### PM2 进程管理

```bash
# 启动
pm2 start server.js --name ocr-server

# 查看状态
pm2 status
pm2 logs ocr-server

# 重启
pm2 restart ocr-server

# 停止
pm2 stop ocr-server
```

#### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

### ✅ 部署检查清单

**服务器环境：**
- [ ] Node.js ≥ 14.0.0（推荐18+）
- [ ] 端口3000可用
- [ ] 已运行 `npm install`

**配置检查：**
- [ ] 已创建 config.js
- [ ] 已填入真实 API Key
- [ ] ❌ config.js 未提交到 Git

**服务验证：**
- [ ] 访问 `http://your-ip:3000/config` 返回配置
- [ ] 访问 `http://your-ip:3000/test-token` 验证 API Key
- [ ] 前端页面正常访问和识别

---

### 🐛 故障排查

**问题1：启动失败**
```bash
# 检查Node版本
node --version  # ≥ 14.0.0

# 重新安装依赖
rm -rf node_modules
npm install
```

**问题2：端口被占用**
```bash
# 查看端口占用
lsof -i :3000
# 或
netstat -tuln | grep 3000

# 杀死进程
kill -9 <PID>
```

**问题3：API Key失败**
```bash
# 检查config.js语法
node -c config.js

# 查看启动日志
# 应该看到：✅ 从 config.js 加载了 N 组 API Key
```

---

## 许可证

本项目使用 MIT License，详见 `LICENSE`。
