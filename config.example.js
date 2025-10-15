// config.example.js - API Key 配置示例文件
// 使用方法：
//   1. 复制此文件为 config.js
//   2. 在 config.js 中填入你的真实 API Key
//   3. config.js 已在 .gitignore 中，不会被提交

module.exports = {
    API_KEYS: [
        {
            id: 1,
            apiKey: 'your_api_key_1',           // 替换为你的 API Key
            secretKey: 'your_secret_key_1',     // 替换为你的 Secret Key
            accessToken: '',
            expireTime: 0
        },
        {
            id: 2,
            apiKey: 'your_api_key_2',           // 可选：添加更多 Key 提高 QPS
            secretKey: 'your_secret_key_2',
            accessToken: '',
            expireTime: 0
        },
        {
            id: 3,
            apiKey: 'your_api_key_3',           // 可选：最多可配置多个 Key
            secretKey: 'your_secret_key_3',
            accessToken: '',
            expireTime: 0
        }
    ]
};

