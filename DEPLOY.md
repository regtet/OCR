# 服务器部署指南

## 📦 必须上传的文件

### 核心文件（必须）
```
OCR/
├── server.js              ✅ 必须 - 服务器主文件
├── index.html             ✅ 必须 - 前端页面
├── package.json           ✅ 必须 - 项目配置和依赖
└── config.example.js      ✅ 推荐 - 配置示例（方便配置）
```

### 可选文件
```
├── env.example            ⭐ 可选 - 环境变量示例
├── README.md              ⭐ 可选 - 项目文档
├── LICENSE                ⭐ 可选 - 许可证
├── image.png              ⭐ 可选 - 截图（文档用）
└── CHANGELOG.md           ⭐ 可选 - 更新日志
```

### ❌ 不要上传
```
❌ node_modules/           # 服务器上重新安装
❌ config.js               # 包含真实API Key，安全风险！
❌ .env                    # 包含敏感信息
❌ package-lock.json       # 可选，建议让服务器生成
❌ .gitignore              # 部署不需要
```

---

## 🚀 部署步骤

### 方式 A：使用 Git（推荐）

```bash
# 1. 在服务器上克隆仓库
git clone https://github.com/regtet/OCR.git
cd OCR

# 2. 安装依赖
npm install

# 3. 创建配置文件
cp config.example.js config.js

# 4. 编辑配置文件，填入真实 API Key
nano config.js  # 或使用 vi/vim

# 5. 启动服务器
node server.js

# 或使用 PM2（推荐生产环境）
npm install -g pm2
pm2 start server.js --name ocr-server
pm2 save
```

---

### 方式 B：手动上传文件

#### 1. 准备文件包
在本地项目目录执行：

```bash
# 创建部署文件夹
mkdir ocr-deploy
cd ocr-deploy

# 复制必须文件
cp ../server.js .
cp ../index.html .
cp ../package.json .
cp ../config.example.js .

# 可选：复制其他文件
cp ../README.md .
cp ../LICENSE .
```

#### 2. 上传到服务器

**使用 SCP：**
```bash
scp -r ocr-deploy/* user@your-server:/path/to/ocr/
```

**使用 SFTP/FTP：**
- 使用 FileZilla 等工具
- 上传 `ocr-deploy` 文件夹内的所有文件

#### 3. 在服务器上配置

```bash
# SSH 登录服务器
ssh user@your-server

# 进入项目目录
cd /path/to/ocr

# 安装依赖
npm install

# 创建配置文件
cp config.example.js config.js
nano config.js  # 填入真实 API Key

# 启动服务
node server.js
```

---

## 🔐 安全配置

### 配置 API Key（重要！）

**方式 1：使用 config.js（推荐）**
```bash
# 在服务器上创建 config.js
nano config.js
```

```javascript
module.exports = {
    API_KEYS: [
        {
            id: 1,
            apiKey: '你的真实API_KEY_1',
            secretKey: '你的真实SECRET_KEY_1',
            accessToken: '',
            expireTime: 0
        }
        // 可添加更多 Key
    ]
};
```

**方式 2：使用环境变量**
```bash
# 创建 .env 文件
nano .env
```

```bash
BAIDU_API_KEY_1=你的API_KEY_1
BAIDU_SECRET_KEY_1=你的SECRET_KEY_1

BAIDU_API_KEY_2=你的API_KEY_2
BAIDU_SECRET_KEY_2=你的SECRET_KEY_2
```

---

## 🔧 生产环境推荐配置

### 1. 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name ocr-server

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status

# 查看日志
pm2 logs ocr-server

# 重启服务
pm2 restart ocr-server
```

### 2. 使用 Nginx 反向代理

```nginx
# /etc/nginx/sites-available/ocr
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/ocr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. 配置防火墙

```bash
# 允许 80 端口（HTTP）
sudo ufw allow 80

# 允许 443 端口（HTTPS）
sudo ufw allow 443

# 内部端口 3000 不需要对外开放
```

---

## 📋 部署检查清单

### 上传前检查
- [ ] 确认已准备好必须文件（server.js, index.html, package.json）
- [ ] ❌ 确认没有包含 config.js（敏感信息）
- [ ] ❌ 确认没有包含 .env（敏感信息）
- [ ] ❌ 确认没有包含 node_modules/（太大，服务器重新安装）

### 服务器配置检查
- [ ] Node.js 版本 ≥ 14.0.0（推荐 18+）
- [ ] 已运行 `npm install`
- [ ] 已创建 config.js 并填入真实 API Key
- [ ] 端口 3000 可用（或修改为其他端口）
- [ ] 防火墙规则配置正确

### 启动检查
- [ ] 服务器成功启动
- [ ] 访问 `http://your-server:3000/config` 返回配置信息
- [ ] 访问 `http://your-server:3000/test-token` 验证 API Key
- [ ] 前端页面可以正常访问

---

## 🔍 故障排查

### 问题 1: 无法启动服务
```bash
# 检查 Node.js 版本
node --version  # 应该 ≥ 14.0.0

# 检查依赖是否安装
ls node_modules/  # 应该有 express, cors, node-fetch

# 重新安装依赖
rm -rf node_modules
npm install
```

### 问题 2: API Key 加载失败
```bash
# 检查 config.js 是否存在
ls -la config.js

# 检查 config.js 语法
node -c config.js

# 查看服务器启动日志
# 应该看到：✅ 从 config.js 加载了 N 组 API Key
```

### 问题 3: 端口被占用
```bash
# 查看端口占用
netstat -tuln | grep 3000
# 或
lsof -i :3000

# 杀死占用端口的进程
kill -9 <PID>

# 或修改端口
# 在 server.js 中修改 app.listen(3000, ...) 为其他端口
```

---

## 📊 最小部署文件大小

```
server.js         ~6 KB
index.html        ~62 KB
package.json      ~1 KB
config.example.js ~1 KB
------------------------
总计：            ~70 KB

加上 node_modules 后约 20-30 MB
```

---

## 🎯 快速部署命令（完整流程）

```bash
# === 在本地 ===
# 1. 准备文件
git clone https://github.com/regtet/OCR.git
cd OCR

# === 上传到服务器 ===
# 2. 使用 rsync 同步（排除不需要的文件）
rsync -av --exclude 'node_modules' \
          --exclude 'config.js' \
          --exclude '.env' \
          --exclude '.git' \
          ./ user@your-server:/path/to/ocr/

# === 在服务器上 ===
# 3. SSH 登录
ssh user@your-server

# 4. 进入目录
cd /path/to/ocr

# 5. 安装依赖
npm install

# 6. 配置 API Key
cp config.example.js config.js
nano config.js  # 填入真实 API Key

# 7. 启动服务（生产环境用 PM2）
npm install -g pm2
pm2 start server.js --name ocr-server
pm2 save
pm2 startup

# 完成！
```

---

## 💡 提示

1. **安全第一**：永远不要上传包含真实 API Key 的文件到 Git 或公开的服务器
2. **使用环境变量**：生产环境推荐使用环境变量或配置管理工具
3. **使用 PM2**：生产环境务必使用 PM2 等进程管理工具，确保服务稳定运行
4. **配置 HTTPS**：使用 Let's Encrypt 免费证书，保护数据传输安全
5. **定期更新**：定期 `git pull` 获取最新代码，`npm update` 更新依赖

---

## 📞 需要帮助？

如遇到问题，检查：
1. Node.js 版本是否符合要求
2. config.js 是否正确配置
3. 防火墙和端口设置
4. 服务器日志：`pm2 logs ocr-server`

