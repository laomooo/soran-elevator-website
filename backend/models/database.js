const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'soran.db');

// 确保数据目录存在
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// 启用外键约束和WAL模式
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// ==================== 创建表结构 ====================
db.exec(`
CREATE TABLE IF NOT EXISTS site_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    company_name TEXT DEFAULT '广州索然电梯配件有限公司',
    company_name_en TEXT DEFAULT 'Guangzhou Soran Elevator Parts Co., Ltd.',
    slogan TEXT DEFAULT '科技绿色 服务生活',
    slogan_en TEXT DEFAULT 'Technology Green, Serving Life',
    address TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    wechat TEXT DEFAULT '',
    about_text TEXT DEFAULT '',
    about_text_en TEXT DEFAULT '',
    logo_url TEXT DEFAULT '/images/logo.png',
    icp TEXT DEFAULT '',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_config (id) VALUES (1);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_en TEXT DEFAULT '',
    description TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO categories (id, name, name_en, sort_order) VALUES
(1, '电梯光幕系统', 'Elevator Light Curtain System', 1),
(2, '红外线感应器', 'Infrared Sensor', 2),
(3, '门机及门系统', 'Door Operator & Door System', 3),
(4, '控制柜组件', 'Control Cabinet Components', 4),
(5, '安全部件', 'Safety Components', 5),
(6, '其他配件', 'Other Accessories', 99);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    model_number TEXT DEFAULT '',
    name TEXT NOT NULL,
    name_en TEXT DEFAULT '',
    short_desc TEXT DEFAULT '',
    short_desc_en TEXT DEFAULT '',
    full_desc TEXT DEFAULT '',
    full_desc_en TEXT DEFAULT '',
    specifications TEXT DEFAULT '{}',
    image_urls TEXT DEFAULT '[]',
    main_image TEXT DEFAULT '',
    is_featured INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT DEFAULT '',
    title_en TEXT DEFAULT '',
    subtitle TEXT DEFAULT '',
    subtitle_en TEXT DEFAULT '',
    image_url TEXT NOT NULL,
    link_url TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    summary TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    logo_url TEXT DEFAULT '',
    website TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    company TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    content TEXT DEFAULT '',
    status TEXT DEFAULT 'unread',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// ==================== 创建索引 ====================
db.exec(`
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);
`);

// ==================== 初始化默认管理员 ====================
const { hashPassword } = require('../utils/hash');
const defaultPasswordHash = hashPassword('soran2024');
try {
    const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
    if (!existing) {
        db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', defaultPasswordHash);
    }
} catch (e) {
    console.error('管理员初始化失败:', e.message);
}

console.log('✅ 数据库初始化完成:', dbPath);

module.exports = db;
