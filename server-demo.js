
// server.js
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));


// const API_KEY = '';      //  你的API Key
// const SECRET_KEY = ''; // 你的 Secret Key

let accessToken = '';
let expireTime = 0;

// 获取 Access Token
async function getAccessToken() {
    const now = Date.now();
    if (accessToken && now < expireTime) {
        return accessToken;
    }

    const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`;
    const res = await fetch(url, { method: 'POST' });
    const data = await res.json();


    if (data.error) {
        throw new Error(`获取Token失败: ${data.error} - ${data.error_description}`);
    }

    accessToken = data.access_token;
    expireTime = now + (data.expires_in - 300) * 1000; // 提前 5 分钟过期
    return accessToken;
}

// OCR 接口
app.post('/ocr', async (req, res) => {
    const { imageBase64 } = req.body;
    try {
        const token = await getAccessToken();

        const ocrUrl = `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${token}`;

        const ocrRes = await fetch(ocrUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `image=${encodeURIComponent(imageBase64)}`
        });

        const data = await ocrRes.json();

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 测试接口，验证API Key是否有效
app.get('/test-token', async (req, res) => {
    try {
        const token = await getAccessToken();
        res.json({
            success: true,
            message: 'API Key有效',
            token: token ? '已获取' : '未获取'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// app.listen(3000, () => console.log('OCR代理服务运行在 http://localhost:3000'));
app.listen(3000, '0.0.0.0', () => console.log('OCR代理服务运行在 http://0.0.0.0:3000'));
