const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// 路由
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// 静态文件
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// API路由
app.use('/api', apiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// 前台页面路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/products.html'));
});
app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/product-detail.html'));
});
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/about.html'));
});
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/contact.html'));
});

// 后台管理入口
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// 404处理
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`  SORAN 电梯配件官网 启动成功!`);
    console.log(`  前台地址: http://localhost:${PORT}`);
    console.log(`  后台管理: http://localhost:${PORT}/admin`);
    console.log(`========================================\n`);
});

module.exports = app;
