const express = require('express');
const db = require('../models/database');

const router = express.Router();

// ==================== 前台API ====================

// 获取站点配置
router.get('/config', (req, res) => {
    try {
        const config = db.prepare('SELECT * FROM site_config WHERE id = 1').get();
        res.json({ success: true, data: config });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// 获取所有分类（仅启用的）
router.get('/categories', (req, res) => {
    const categories = db.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC').all();
    res.json({ success: true, data: categories });
});

// 获取产品列表（支持分页、分类筛选）
router.get('/products', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const categoryId = req.query.category;
    const keyword = req.query.keyword;

    let where = 'WHERE p.is_active = 1';
    let params = [];

    if (categoryId && categoryId !== 'all') {
        where += ' AND p.category_id = ?';
        params.push(parseInt(categoryId));
    }
    if (keyword) {
        where += ' AND (p.name LIKE ? OR p.model_number LIKE ? OR p.short_desc LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const count = db.prepare(`SELECT COUNT(*) as total FROM products p ${where}`).get(...params);
    const offset = (page - 1) * limit;

    const products = db.prepare(`
        SELECT p.*, c.name as category_name
        FROM products p LEFT JOIN categories c ON p.category_id = c.id
        ${where}
        ORDER BY p.sort_order ASC, p.id DESC
        LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    res.json({
        success: true,
        data: products,
        pagination: {
            current: page,
            pageSize: limit,
            total: count.total,
            totalPages: Math.ceil(count.total / limit)
        }
    });
});

// 获取单个产品详情
router.get('/products/:id', (req, res) => {
    const product = db.prepare(`
        SELECT p.*, c.name as category_name
        FROM products p LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ? AND p.is_active = 1
    `).get(req.params.id);

    if (!product) {
        return res.status(404).json({ success: false, message: '产品不存在' });
    }

    // 增加浏览量
    db.prepare('UPDATE products SET views = views + 1 WHERE id = ?').run(req.params.id);

    // 解析JSON字段
    try { product.image_urls = JSON.parse(product.image_urls); } catch(e) { product.image_urls = []; }
    try { product.specifications = JSON.parse(product.specifications); } catch(e) { product.specifications = {}; }

    res.json({ success: true, data: product });
});

// 获取精选/推荐产品（首页展示）
router.get('/products/featured/:limit?', (req, res) => {
    const limit = parseInt(req.params.limit) || 8;
    const products = db.prepare(`
        SELECT p.*, c.name as category_name
        FROM products p LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = 1 AND p.is_featured = 1
        ORDER BY p.sort_order ASC
        LIMIT ?
    `).all(limit);

    res.json({ success: true, data: products });
});

// 获取轮播/Banner列表
router.get('/banners', (req, res) => {
    const banners = db.prepare(
        'SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC'
    ).all();
    res.json({ success: true, data: banners });
});

// 获取新闻动态
router.get('/news', (req, res) => {
    const limit = parseInt(req.query.limit) || 6;
    const news = db.prepare(
        'SELECT * FROM news WHERE is_active = 1 ORDER BY created_at DESC LIMIT ?'
    ).all(limit);
    res.json({ success: true, data: news });
});

// 获取合作伙伴
router.get('/partners', (req, res) => {
    const partners = db.prepare(
        'SELECT * FROM partners WHERE is_active = 1 ORDER BY sort_order ASC'
    ).all();
    res.json({ success: true, data: partners });
});

// 提交留言
router.post('/messages', (req, res) => {
    const { name, phone, email, company, subject, content } = req.body;
    
    if (!name || !content) {
        return res.status(400).json({ success: false, message: '请填写必要信息' });
    }

    try {
        db.prepare(
            'INSERT INTO messages (name, phone, email, company, subject, content) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(name, phone, email, company, subject, content);
        res.json({ success: true, message: '留言提交成功，我们会尽快与您联系！' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;
