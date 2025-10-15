
// server.js - 多 Key 轮询版本
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ============================================================
// 多组 API Key 配置（轮询策略，提高 QPS 上限）
// ============================================================

// 加载配置：优先级 config.js > 环境变量 > 默认配置
let API_KEYS = [];

// 方式1: 从 config.js 读取（推荐）
const configPath = path.join(__dirname, 'config.js');
if (fs.existsSync(configPath)) {
    try {
        const config = require('./config.js');
        API_KEYS = config.API_KEYS || [];
        console.log(`✅ 从 config.js 加载了 ${API_KEYS.length} 组 API Key`);
    } catch (err) {
        console.error('❌ 加载 config.js 失败:', err.message);
    }
}

// 方式2: 从环境变量读取（备选）
if (API_KEYS.length === 0 && process.env.BAIDU_API_KEY_1) {
    const keys = [];
    for (let i = 1; i <= 10; i++) {
        const apiKey = process.env[`BAIDU_API_KEY_${i}`];
        const secretKey = process.env[`BAIDU_SECRET_KEY_${i}`];
        if (apiKey && secretKey) {
            keys.push({
                id: i,
                apiKey: apiKey,
                secretKey: secretKey,
                accessToken: '',
                expireTime: 0
            });
        }
    }
    if (keys.length > 0) {
        API_KEYS = keys;
        console.log(`✅ 从环境变量加载了 ${API_KEYS.length} 组 API Key`);
    }
}

// 方式3: 默认配置（仅用于开发测试，生产环境请使用 config.js）
if (API_KEYS.length === 0) {
    console.warn('⚠️  警告: 未找到配置文件，使用默认配置');
    console.warn('⚠️  请复制 config.example.js 为 config.js 并填入真实 API Key');
    API_KEYS = [
        {
            id: 1,
            apiKey: 'your_api_key_1',
            secretKey: 'your_secret_key_1',
            accessToken: '',
            expireTime: 0
        }
    ];
}

// 当前轮询索引
let currentKeyIndex = 0;

// 获取 Access Token（支持多 Key）
async function getAccessToken(keyConfig) {
    const now = Date.now();
    if (keyConfig.accessToken && now < keyConfig.expireTime) {
        return keyConfig.accessToken;
    }

    const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${keyConfig.apiKey}&client_secret=${keyConfig.secretKey}`;
    const res = await fetch(url, { method: 'POST' });
    const data = await res.json();

    if (data.error) {
        throw new Error(`Key${keyConfig.id} 获取Token失败: ${data.error} - ${data.error_description}`);
    }

    keyConfig.accessToken = data.access_token;
    keyConfig.expireTime = now + (data.expires_in - 300) * 1000; // 提前 5 分钟过期
    return keyConfig.accessToken;
}

// 轮询获取下一个可用的 Key
function getNextKey() {
    const key = API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return key;
}

// OCR 接口（支持多 Key 轮询与智能重试）
app.post('/ocr', async (req, res) => {
    const { imageBase64 } = req.body;

    // 尝试所有可用的 Key，遇到 QPS 限制自动切换
    let lastError = null;

    for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
        try {
            const keyConfig = getNextKey();
            const token = await getAccessToken(keyConfig);

            const ocrUrl = `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${token}`;

            const ocrRes = await fetch(ocrUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `image=${encodeURIComponent(imageBase64)}`
            });

            const data = await ocrRes.json();

            // 检查是否是 QPS 限制错误
            const errorMsg = data.error_msg || '';
            if (data.error_code === 18 || errorMsg.includes('qps') || errorMsg.includes('limit')) {
                console.log(`Key${keyConfig.id} 遇到 QPS 限制，尝试下一个 Key...`);
                lastError = data;
                continue; // 尝试下一个 Key
            }

            // 成功，返回结果
            return res.json(data);
        } catch (err) {
            console.error(`Key 请求失败: ${err.message}`);
            lastError = err;
        }
    }

    // 所有 Key 都失败了
    console.error('所有 API Key 都已达到 QPS 限制');
    res.json(lastError || { error: '所有 API Key 都已达到 QPS 限制，请稍后重试' });
});

// 获取服务器配置信息（供前端动态获取 QPS 配置）
app.get('/config', (req, res) => {
    res.json({
        totalKeys: API_KEYS.length,
        maxQPS: API_KEYS.length * 2, // 每个 Key 支持 2 QPS
        recommendedQPS: Math.min(API_KEYS.length * 2, 6)
    });
});

// 测试接口，验证所有 API Key 是否有效
app.get('/test-token', async (req, res) => {
    const results = [];

    for (const keyConfig of API_KEYS) {
        try {
            const token = await getAccessToken(keyConfig);
            results.push({
                keyId: keyConfig.id,
                success: true,
                message: 'Token 获取成功',
                hasToken: !!token
            });
        } catch (err) {
            results.push({
                keyId: keyConfig.id,
                success: false,
                error: err.message
            });
        }
    }

    const successCount = results.filter(r => r.success).length;

    res.json({
        totalKeys: API_KEYS.length,
        successfulKeys: successCount,
        maxQPS: successCount * 2,
        results: results
    });
});

// 启动服务
app.listen(3000, '0.0.0.0', () => {
    console.log('============================================================');
    console.log('🚀 OCR 代理服务已启动');
    console.log('============================================================');
    console.log(`📡 服务地址: http://0.0.0.0:3000`);
    console.log(`🔑 已配置 ${API_KEYS.length} 组 API Key (理论最大 QPS: ${API_KEYS.length * 2})`);
    console.log('🔄 轮询策略: 自动切换 Key，遇到 QPS 限制立即尝试下一个');
    console.log('============================================================');
    console.log('💡 测试所有 Key 是否有效: curl http://localhost:3000/test-token');
    console.log('============================================================');
});
