const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { comparePassword, hashPassword } = require('../utils/hash');

// ==================== 认证中间件 ====================
function authMiddleware(req, res, next) {
    const token = req.cookies?.admin_token || req.headers['x-admin-token'];
    if (!token) {
        return res.status(401).json({ success: false, message: '未登录' });
    }
    // 简单token验证（实际项目应使用JWT）
    const admin = db.prepare('SELECT id, username, role FROM admins WHERE id = ?').get(token);
    if (!admin) {
        return res.status(401).json({ success: false, message: '登录已过期' });
    }
    req.admin = admin;
    next();
}

// 登录
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: '请输入用户名和密码' });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    if (!admin || !comparePassword(password, admin.password_hash)) {
        return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    db.prepare('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(admin.id);

    // 设置cookie
    res.cookie('admin_token', String(admin.id), {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    });

    res.json({ success: true, data: { id: admin.id, username: admin.username, role: admin.role } });
});

// 登出
router.post('/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true, message: '已退出登录' });
});

// 获取当前用户信息
router.get('/me', authMiddleware, (req, res) => {
    res.json({ success: true, data: req.admin });
});

// ==================== 站点配置管理 ====================
router.get('/config', authMiddleware, (req, res) => {
    const config = db.prepare('SELECT * FROM site_config WHERE id = 1').get();
    res.json({ success: true, data: config });
});

router.put('/config', authMiddleware, (req, res) => {
    try {
        const fields = ['company_name', 'company_name_en', 'slogan', 'slogan_en',
            'address', 'phone', 'email', 'wechat', 'about_text', 'about_text_en',
            'logo_url', 'icp'];
        const sets = [];
        const values = [];

        for (const f of fields) {
            if (req.body[f] !== undefined) {
                sets.push(`${f} = ?`);
                values.push(req.body[f]);
            }
        }
        sets.push('updated_at = CURRENT_TIMESTAMP');

        db.prepare(`UPDATE site_config SET ${sets.join(', ')} WHERE id = 1`).run(...values);
        res.json({ success: true, message: '配置更新成功' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ==================== 产品分类管理（CRUD）====================
router.get('/categories', authMiddleware, (req, res) => {
    const list = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
    res.json({ success: true, data: list });
});

router.post('/categories', authMiddleware, (req, res) => {
    const { name, name_en, description, sort_order } = req.body;
    if (!name) return res.status(400).json({ success: false, message: '分类名称不能为空' });

    const result = db.prepare(
        'INSERT INTO categories (name, name_en, description, sort_order) VALUES (?, ?, ?, COALESCE(?, 0))'
    ).run(name, name_en || '', description || '', sort_order);

    res.json({ success: true, data: { id: result.lastInsertRowid }, message: '分类创建成功' });
});

router.put('/categories/:id', authMiddleware, (req, res) => {
    const { name, name_en, description, sort_order, is_active } = req.body;
    db.prepare(
        `UPDATE categories SET 
            name = COALESCE(?, name), 
            name_en = COALESCE(?, name_en), 
            description = COALESCE(?, description),
            sort_order = COALESCE(?, sort_order),
            is_active = COALESCE(?, is_active),
            updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
    ).run(name, name_en, description, sort_order, is_active, req.params.id);

    res.json({ success: true, message: '分类更新成功' });
});

router.delete('/categories/:id', authMiddleware, (req, res) => {
    const hasProducts = db.prepare('SELECT COUNT(*) as c FROM products WHERE category_id = ?').get(req.params.id);
    if (hasProducts.c > 0) {
        return res.status(400).json({ success: false, message: '该分类下还有产品，无法删除' });
    }
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: '分类删除成功' });
});

// ==================== 产品管理（CRUD）====================
router.get('/products', authMiddleware, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const categoryId = req.query.category;

    let where = '';
    let params = [];
    if (categoryId && categoryId !== 'all') {
        where = 'WHERE p.category_id = ?';
        params.push(parseInt(categoryId));
    }

    const count = db.prepare(`SELECT COUNT(*) as total FROM products p ${where}`).get(...params);
    const products = db.prepare(`
        SELECT p.*, c.name as category_name
        FROM products p LEFT JOIN categories c ON p.category_id = c.id
        ${where}
        ORDER BY p.id DESC LIMIT ? OFFSET ?
    `).all(...params, limit, (page - 1) * limit);

    res.json({
        success: true,
        data: products,
        pagination: { current: page, pageSize: limit, total: count.total }
    });
});

router.post('/products', authMiddleware, (req, res) => {
    const {
        category_id, model_number, name, name_en, short_desc, short_desc_en,
        full_desc, full_desc_en, specifications, image_urls, main_image, is_featured, sort_order
    } = req.body;

    if (!name) return res.status(400).json({ success: false, message: '产品名称不能为空' });

    const result = db.prepare(`
        INSERT INTO products (
            category_id, model_number, name, name_en, short_desc, short_desc_en,
            full_desc, full_desc_en, specifications, image_urls, main_image,
            is_featured, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        category_id || null, model_number || '', name, name_en || '',
        short_desc || '', short_desc_en || '',
        full_desc || '', full_desc_en || '',
        specifications || '{}', JSON.stringify(image_urls || []),
        main_image || '', is_featured ? 1 : 0, sort_order || 0
    );

    res.json({ success: true, data: { id: result.lastInsertRowid }, message: '产品创建成功' });
});

router.put('/products/:id', authMiddleware, (req, res) => {
    const body = req.body;
    // 处理image_urls为数组JSON
    if (body.image_urls && Array.isArray(body.image_urls)) {
        body.image_urls = JSON.stringify(body.image_urls);
    }

    const sets = Object.keys(body)
        .filter(k => ['category_id', 'model_number', 'name', 'name_en', 'short_desc',
            'short_desc_en', 'full_desc', 'full_desc_en', 'specifications',
            'image_urls', 'main_image', 'is_featured', 'sort_order', 'is_active'].includes(k))
        .map(k => `${k} = ?`);

    if (sets.length === 0) {
        return res.status(400).json({ success: false, message: '没有可更新的字段' });
    }

    sets.push('updated_at = CURRENT_TIMESTAMP');
    const values = [...Object.keys(body).filter(k =>
        ['category_id', 'model_number', 'name', 'name_en', 'short_desc',
            'short_desc_en', 'full_desc', 'full_desc_en', 'specifications',
            'image_urls', 'main_image', 'is_featured', 'sort_order', 'is_active'].includes(k)
    ).map(k => body[k]), req.params.id];

    db.prepare(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`).run(...values);
    res.json({ success: true, message: '产品更新成功' });
});

router.delete('/products/:id', authMiddleware, (req, res) => {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: '产品删除成功' });
});

// ==================== 轮播Banner管理 ====================
router.get('/banners', authMiddleware, (req, res) => {
    const list = db.prepare('SELECT * FROM banners ORDER BY sort_order ASC').all();
    res.json({ success: true, data: list });
});

router.post('/banners', authMiddleware, (req, res) => {
    const { title, title_en, subtitle, subtitle_en, image_url, link_url, sort_order } = req.body;
    if (!image_url) return res.status(400).json({ success: false, message: '请上传轮播图片' });

    const result = db.prepare(
        'INSERT INTO banners (title, title_en, subtitle, subtitle_en, image_url, link_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(title || '', title_en || '', subtitle || '', subtitle_en || '', image_url, link_url || '', sort_order || 0);

    res.json({ success: true, data: { id: result.lastInsertRowid }, message: '轮播创建成功' });
});

router.delete('/banners/:id', authMiddleware, (req, res) => {
    db.prepare('DELETE FROM banners WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: '轮播删除成功' });
});

// ==================== 新闻管理 ====================
router.get('/news', authMiddleware, (req, res) => {
    const list = db.prepare('SELECT * FROM news ORDER BY created_at DESC').all();
    res.json({ success: true, data: list });
});

router.post('/news', authMiddleware, (req, res) => {
    const { title, content, summary, cover_image } = req.body;
    if (!title) return res.status(400).json({ success: false, message: '标题不能为空' });

    const result = db.prepare(
        'INSERT INTO news (title, content, summary, cover_image) VALUES (?, ?, ?, ?)'
    ).run(title, content || '', summary || '', cover_image || '');

    res.json({ success: true, data: { id: result.lastInsertRowid }, message: '新闻创建成功' });
});

router.put('/news/:id', authMiddleware, (req, res) => {
    const { title, content, summary, cover_image, is_active } = req.body;
    db.prepare(
        `UPDATE news SET 
            title = COALESCE(?, title),
            content = COALESCE(?, content),
            summary = COALESCE(?, summary),
            cover_image = COALESCE(?, cover_image),
            is_active = COALESCE(?, is_active),
            updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
    ).run(title, content, summary, cover_image, is_active, req.params.id);
    res.json({ success: true, message: '新闻更新成功' });
});

router.delete('/news/:id', authMiddleware, (req, res) => {
    db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: '新闻删除成功' });
});

// ==================== 合作伙伴管理 ====================
router.get('/partners', authMiddleware, (req, res) => {
    const list = db.prepare('SELECT * FROM partners ORDER BY sort_order ASC').all();
    res.json({ success: true, data: list });
});

router.post('/partners', authMiddleware, (req, res) => {
    const { name, logo_url, website, sort_order } = req.body;
    if (!name) return res.status(400).json({ success: false, message: '名称不能为空' });

    const result = db.prepare(
        'INSERT INTO partners (name, logo_url, website, sort_order) VALUES (?, ?, ?, ?)'
    ).run(name, logo_url || '', website || '', sort_order || 0);

    res.json({ success: true, data: { id: result.lastInsertRowid } });
});

router.delete('/partners/:id', authMiddleware, (req, res) => {
    db.prepare('DELETE FROM partners WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: '删除成功' });
});

// ==================== 留言管理 ====================
router.get('/messages', authMiddleware, (req, res) => {
    const list = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
    res.json({ success: true, data: list });
});

router.patch('/messages/:id/read', authMiddleware, (req, res) => {
    db.prepare("UPDATE messages SET status = 'read' WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: '已标记为已读' });
});

router.delete('/messages/:id', authMiddleware, (req, res) => {
    db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: '留言已删除' });
});

// ==================== 统计数据 ====================
router.get('/stats', authMiddleware, (req, res) => {
    const productCount = db.prepare('SELECT COUNT(*) as c FROM products WHERE is_active = 1').get();
    const categoryCount = db.prepare('SELECT COUNT(*) as c FROM categories WHERE is_active = 1').get();
    const messageUnread = db.prepare("SELECT COUNT(*) as c FROM messages WHERE status = 'unread'").get();
    const totalViews = db.prepare('SELECT SUM(views) as c FROM products').get();

    res.json({
        success: true,
        data: {
            products: productCount.c,
            categories: categoryCount.c,
            unreadMessages: messageUnread.c,
            totalViews: totalViews.c || 0
        }
    });
});

module.exports = router;
