/**
 * 构建 docs/ 目录用于 GitHub Pages 部署
 * 
 * 此脚本将前端静态文件处理为相对路径，并复制到 docs/ 目录
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');

// 确保 docs 目录存在
const dirs = ['css', 'js', 'images', 'admin/css', 'admin/js'];
dirs.forEach(d => fs.mkdirSync(path.join(DOCS, d), { recursive: true }));

// 复制静态资源
const copies = [
    ['frontend/css/style.css', 'docs/css/style.css'],
    ['frontend/images/logo.png', 'docs/images/logo.png'],
    ['frontend/images/favicon.png', 'docs/images/favicon.png'],
    ['frontend/images/logo-icon.png', 'docs/images/logo-icon.png'],
    ['admin/css/admin.css', 'docs/admin/css/admin.css'],
    ['public/js/supabase-client.js', 'docs/js/supabase-client.js'],
    ['public/js/supabase-client.js', 'docs/admin/js/supabase-client.js'],
];

copies.forEach(([src, dest]) => {
    const srcPath = path.join(ROOT, src);
    const destPath = path.join(ROOT, dest);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ ${src} -> ${dest}`);
    } else {
        console.warn(`⚠️  未找到: ${src}`);
    }
});

// 复制并转换 JS 文件（路径转换）
const jsFiles = [
    ['frontend/js/main.js', 'docs/js/main.js'],
    ['admin/js/admin.js', 'docs/admin/js/admin.js'],
];

jsFiles.forEach(([src, dest]) => {
    const srcPath = path.join(ROOT, src);
    const destPath = path.join(ROOT, dest);
    if (!fs.existsSync(srcPath)) {
        console.warn(`⚠️  未找到: ${src}`);
        return;
    }
    let content = fs.readFileSync(srcPath, 'utf8');
    
    // 转换 product 链接: /product/${p.id} -> product-detail.html?id=${p.id}
    content = content.replace(/\/product\/\$\{p\.id\}/g, 'product-detail.html?id=${p.id}');
    
    // 转换管理后台路径
    if (dest.includes('/admin/')) {
        content = content.replace(/'\/admin\/login\.html'/g, "'login.html'");
        content = content.replace(/'\/admin\/'/g, "'./'");
        content = content.replace(/'\/admin\//g, "'");
    }
    
    fs.writeFileSync(destPath, content, 'utf8');
    console.log(`✅ ${src} -> ${dest} (已转换路径)`);
});

// 创建 .nojekyll
fs.writeFileSync(path.join(DOCS, '.nojekyll'), '');
console.log('✅ 创建 .nojekyll');

console.log('\n🎉 docs/ 构建完成！');
console.log('  在 GitHub Settings -> Pages 中设置:');
console.log('  Source: Deploy from a branch');
console.log('  Branch: main, /docs folder');
