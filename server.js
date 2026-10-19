const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'web-dev-agency-secret-key-2024',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback
const pages = ['/', '/login', '/packages', '/order', '/member', '/admin'];
pages.forEach(route => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
});

// API 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// 启动服务器（等待数据库初始化）
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`\n  🚀 商业接单官网已启动`);
    console.log(`  📍 本地地址: http://localhost:${PORT}`);
    console.log(`  📍 管理后台: http://localhost:${PORT}/admin`);
    console.log(`  👤 管理员账号: admin / admin123\n`);
  });
}).catch(err => {
  console.error('数据库初始化失败:', err);
  process.exit(1);
});
