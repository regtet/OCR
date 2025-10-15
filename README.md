## OCR — 图片 OCR 识别与智能匹配工具

简洁版网页工具，支持将两组图片（A 为模板、B 为待重命名）进行 OCR 识别、智能匹配与一键下载重命名结果。

![主界面截图](./image.png)

---

## 功能概览

- **文件导入**: A/B 两组各自选择或拖拽导入，支持多次追加与单张删除。
- **OCR 识别**: 仅识别未识别/失败项；并发度 2；内置全局 QPS 限制（默认 2，可调 1–10）与网络/限流重试。
- **智能匹配与重命名**:
  - 仅匹配与 A 尺寸一致的 B；
  - 文本相似度≥阈值（0–1，默认 0.5）才算匹配；
  - 支持手动匹配与冲突处理（同名冲突会回退冲突 B 并标记 unmatched）。
- **下载**: 批量单张下载或打包 ZIP 下载。
- **可视化**: 网格预览、OCR 文本、分辨率、匹配状态、统计面板与大图预览。

---

## 目录结构

```
OCR/
├── server.js              # 主服务器（多Key轮询）
├── index.html             # 主前端页面（推荐使用）
├── ocrplus.html           # 增强版前端（⚠️ 保持原样，不要修改）
├── config.example.js      # 配置文件示例
├── env.example            # 环境变量示例
├── package.json           # 项目配置
├── package-lock.json      # 依赖锁定
├── .gitignore             # Git 忽略配置
├── CHANGELOG.md           # 更新日志
├── README.md              # 本文件
├── LICENSE                # MIT 许可证
├── image.png              # 截图
├── ocrplus.png            # 截图
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

- **ocrplus.html**: 增强版（包含格式转换）
  - ⚠️ **重要**: 此文件保持原样，不要修改
  - API 地址: `http://0.0.0.0:3000/ocr`

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

- 直接在浏览器打开 `index.html`
- 上传 A 组（参考模板）和 B 组（待重命名）图片
- 点击"开始识别并自动匹配"
- 前端会自动从服务器获取 QPS 配置

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

## OCRPlus 增强版说明

`ocrplus.html` 为增强版页面，包含"格式转换与下载"整套流程：

![OCRPlus 界面](./ocrplus.png)

### 主要差异

- ✅ 增加了格式转换面板（JPG/PNG/WebP/AVIF/ICO 等，质量可调，重命名规则可选）
- 📊 OCR 流程以顺序进度条呈现
- 🔧 手动匹配同样要求尺寸一致；提供结果列表与 ZIP 打包下载

### ⚠️ 重要提示

**此文件保持原样，永远不要修改 `ocrplus.html`！**

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

### Q6: 为什么不能修改 ocrplus.html？
**A**:
- ocrplus.html 是独立的增强版本
- 使用不同的 API 地址配置
- 保持原样以避免兼容性问题

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

## 许可证

本项目使用 MIT License，详见 `LICENSE`。
