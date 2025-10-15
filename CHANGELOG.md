# 更新日志

## [1.1.0] - 2025-10-16

### ✨ 新增功能
- 新增 `/config` API 接口，支持前端动态获取服务器 QPS 配置
- 前端 QPS 滑块自动与服务器配置同步，避免超限
- 支持环境变量配置 API Key，提高安全性

### 🔧 改进优化
- `index.html` 启动时自动从服务器获取最大 QPS 配置
- QPS 滑块最大值根据服务器 API Key 数量动态调整
- 整合项目文档到 `README.md`，删除冗余的 `PROJECT_STRUCTURE.md`

### 🔐 安全增强
- 支持通过 `.env` 文件配置敏感信息
- 提供 `config.example.js` 示例配置文件
- 更新 `.gitignore` 排除配置文件，防止密钥泄露

### 🐛 Bug 修复
- 修复 `server.js` 模块语法兼容性问题（ES6 → CommonJS）
- 修复 Node.js 14 版本兼容性

### 📝 文档更新
- 完善 `README.md`，新增 QPS 协同机制说明
- 新增详细的 API 接口文档
- 扩充常见问题解答（FAQ）
- 新增安全配置说明

### ⚠️ 破坏性变更
- 无

### 🔄 迁移指南
1. 复制 `config.example.js` 为 `config.js`
2. 在 `config.js` 中填入你的 API Key
3. 或者创建 `.env` 文件配置环境变量

---

## Git 提交信息建议

### Commit Message（简洁版）
```
feat: 实现前后端 QPS 自动协同 & API Key 安全配置

- 新增 /config 接口动态返回服务器配置
- 前端自动获取并同步 QPS 限制
- 支持环境变量安全配置 API Key
- 整合文档到 README.md
```

### Commit Message（详细版）
```
feat: 实现前后端 QPS 自动协同机制和安全配置方案

新增功能：
- [server.js] 新增 GET /config 接口，返回 API Key 数量和最大 QPS
- [index.html] 页面加载时自动获取服务器配置
- [index.html] QPS 滑块最大值动态调整（基于服务器 Key 数量）

安全改进：
- 支持通过 .env 文件配置 API Key
- 支持通过 config.js 配置文件管理密钥
- 提供 config.example.js 示例文件
- 更新 .gitignore 排除敏感文件

代码优化：
- server.js 从 ES6 模块改为 CommonJS（兼容 Node.js 14+）
- 删除冗余的 PROJECT_STRUCTURE.md
- 完善 README.md 文档

破坏性变更：无
迁移说明：见 README.md

Closes #issue号（如果有关联 issue）
```

### 推荐的 Commit 规范

```bash
# 功能
feat: 新增 XXX 功能
fix: 修复 XXX 问题
docs: 更新文档
style: 代码格式调整（不影响功能）
refactor: 重构代码
perf: 性能优化
test: 测试相关
chore: 构建/工具相关

# 示例
git commit -m "feat: 实现前后端 QPS 自动协同机制"
git commit -m "feat(security): 支持环境变量配置 API Key"
git commit -m "docs: 完善 README.md 文档"
```

