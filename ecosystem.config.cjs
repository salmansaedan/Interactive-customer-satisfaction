// إعداد PM2 لتطبيق عميلي أولاً
module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=webapp-production --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false, // تعطيل مراقبة الملفات في PM2 (wrangler يتولى hot reloading)
      instances: 1, // وضع التطوير يستخدم instance واحد فقط
      exec_mode: 'fork'
    }
  ]
}