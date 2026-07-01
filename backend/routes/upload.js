const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 按日期分子目录
        const dateDir = new Date().toISOString().slice(0, 10);
        const dir = path.join(uploadDir, dateDir);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // 原始扩展名 + 时间戳防止重名
        const ext = path.extname(file.originalname);
        const name = Date.now() + '-' + Math.round(Math.random() * 9999) + ext;
        cb(null, name);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/i;
    if (allowed.test(path.extname(file.originalname))) {
        cb(null, true);
    } else {
        cb(new Error('仅允许上传图片文件 (jpg/png/gif/webp/svg)'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter
});

// 单文件上传
router.post('/image', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: '请选择要上传的图片' });
    }

    const dateDir = new Date().toISOString().slice(0, 10);
    const url = `/uploads/${dateDir}/${req.file.filename}`;
    
    res.json({
        success: true,
        data: {
            url: url,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        }
    });
});

// 多文件上传
router.post('/images', upload.array('files', 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: '请选择要上传的图片' });
    }

    const results = req.files.map(file => ({
        url: `/uploads/${new Date().toISOString().slice(0, 10)}/${file.filename}`,
        originalName: file.originalname,
        size: file.size
    }));

    res.json({ success: true, data: results });
});

// 错误处理
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ success: false, message: '图片大小不能超过10MB' });
        }
        return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
});

module.exports = router;
