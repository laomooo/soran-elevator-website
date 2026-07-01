// ==================== Admin Panel JavaScript (Supabase 版本) ====================

// Auth state
let currentUser = null;

// Check auth using Supabase session
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) return null;

        // Verify user exists in admins table
        const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (adminError || !adminData) return null;

        return {
            email: session.user.email,
            username: adminData.username,
            role: adminData.role
        };
    } catch (e) {
        console.error('Auth check error:', e);
        return null;
    }
}

// Redirect to login if not authenticated
if (window.location.pathname.includes('/admin') && !window.location.pathname.includes('login')) {
    checkAuth().then(user => {
        if (!user) {
            window.location.href = 'login.html';
        } else {
            currentUser = user;
            const userEl = document.getElementById('topbar-user');
            if (userEl) userEl.textContent = user.username;
            const avatarEl = document.getElementById('topbar-user-avatar');
            if (avatarEl) avatarEl.textContent = user.username.charAt(0).toUpperCase();
        }
    });
}

// ==================== Utility ====================
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ==================== Toast Notification ====================
function toast(message, type = 'success') {
    let el = document.querySelector('.toast');
    if (!el) {
        el = document.createElement('div');
        el.className = `toast toast--${type}`;
        document.body.appendChild(el);
    } else {
        el.className = `toast toast--${type} show`;
    }
    el.textContent = message;
    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => el.classList.remove('show'), 3200);
}

// ==================== Supabase API Helper ====================
// 直接使用 supabase 全局变量，此函数用于兼容旧的异步调用模式
async function api(path, options = {}) {
    try {
        let result;
        const method = options.method || 'GET';
        const body = options.body ? JSON.parse(options.body) : null;

        // GET /stats
        if (path === '/stats') {
            const [{ count: productCount }, { count: categoryCount }, { count: unreadCount }] = await Promise.all([
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', 1),
                supabase.from('categories').select('*', { count: 'exact', head: true }).eq('is_active', 1),
                supabase.from('messages').select('*', { count: 'exact', head: true }).eq('status', 'unread')
            ]);
            result = {
                success: true,
                data: {
                    products: productCount,
                    categories: categoryCount,
                    unreadMessages: unreadCount || 0,
                    totalViews: 0
                }
            };
        }
        // GET /config
        else if (path === '/config') {
            if (method === 'GET') {
                const { data, error } = await supabase.from('site_config').select('*').single();
                if (error) throw error;
                result = { success: true, data };
            } else if (method === 'PUT') {
                const updateData = {
                    company_name: body.company_name,
                    company_name_en: body.company_name_en,
                    slogan: body.slogan,
                    slogan_en: body.slogan_en,
                    phone: body.phone,
                    email: body.email,
                    wechat: body.wechat,
                    address: body.address,
                    about_text: body.about_text,
                    logo_url: body.logo_url,
                    icp: body.icp,
                    updated_at: new Date().toISOString()
                };
                // Add optional hero/cta fields if they exist in the body
                if (body.hero_title !== undefined) updateData.hero_title = body.hero_title;
                if (body.hero_subtitle !== undefined) updateData.hero_subtitle = body.hero_subtitle;
                if (body.hero_bg_color1 !== undefined) updateData.hero_bg_color1 = body.hero_bg_color1;
                if (body.hero_bg_color2 !== undefined) updateData.hero_bg_color2 = body.hero_bg_color2;
                if (body.hero_bg_image !== undefined) updateData.hero_bg_image = body.hero_bg_image;
                if (body.cta_title !== undefined) updateData.cta_title = body.cta_title;
                if (body.cta_subtitle !== undefined) updateData.cta_subtitle = body.cta_subtitle;
                if (body.cta_button_text !== undefined) updateData.cta_button_text = body.cta_button_text;
                if (body.cta_bg_image !== undefined) updateData.cta_bg_image = body.cta_bg_image;
                
                const { error } = await supabase.from('site_config').update(updateData).eq('id', 1);
                if (error) throw error;
                result = { success: true, message: '设置保存成功！' };
            }
        }
        // GET /categories
        else if (path === '/categories') {
            if (method === 'GET') {
                const { data, error } = await supabase.from('categories').select('*').order('sort_order');
                if (error) throw error;
                result = { success: true, data };
            } else if (method === 'POST') {
                const { data, error } = await supabase.from('categories').insert([body]).select().single();
                if (error) throw error;
                result = { success: true, data, message: '分类创建成功！' };
            }
        }
        // PUT/DELETE /categories/:id
        else if (/^\/categories\/\d+$/.test(path)) {
            const id = parseInt(path.split('/').pop());
            if (method === 'PUT') {
                const { error } = await supabase.from('categories').update({
                    name: body.name,
                    name_en: body.name_en,
                    description: body.description,
                    sort_order: body.sort_order,
                    updated_at: new Date().toISOString()
                }).eq('id', id);
                if (error) throw error;
                result = { success: true, message: '分类更新成功！' };
            } else if (method === 'DELETE') {
                const { error } = await supabase.from('categories').delete().eq('id', id);
                if (error) throw error;
                result = { success: true, message: '分类已删除' };
            }
        }
        // GET/PUT/DELETE /products/:id (MUST be before /products to avoid being intercepted by startsWith)
        else if (/^\/products\/\d+$/.test(path)) {
            const id = parseInt(path.split('/').pop());
            if (method === 'GET') {
                const { data, error } = await supabase
                    .from('products')
                    .select('*, category:categories(name)')
                    .eq('id', id)
                    .single();
                if (error) throw error;
                if (data) data.category_name = data.category?.name || '';
                result = { success: true, data };
            } else if (method === 'PUT') {
                const { error } = await supabase.from('products').update({
                    name: body.name,
                    model_number: body.model_number,
                    category_id: body.category_id || null,
                    sort_order: body.sort_order || 0,
                    short_desc: body.short_desc,
                    full_desc: body.full_desc,
                    main_image: body.main_image,
                    image_urls: body.image_urls,
                    is_featured: body.is_featured != null ? body.is_featured : 0,
                    is_active: body.is_active != null ? body.is_active : 1,
                    updated_at: new Date().toISOString()
                }).eq('id', id);
                if (error) throw error;
                result = { success: true, message: '产品更新成功！' };
            } else if (method === 'DELETE') {
                const { error } = await supabase.from('products').delete().eq('id', id);
                if (error) throw error;
                result = { success: true, message: '产品已删除' };
            }
        }
        // GET /products?limit=100 | POST /products (generic - AFTER /products/:id)
        else if (path.startsWith('/products')) {
            if (method === 'GET') {
                const urlParts = path.split('?')[1] || '';
                const urlParams = new URLSearchParams(urlParts);
                const limit = parseInt(urlParams.get('limit')) || 100;

                const { data, error } = await supabase
                    .from('products')
                    .select('*, category:categories(name)')
                    .order('sort_order')
                    .limit(limit);
                if (error) throw error;

                const products = (data || []).map(p => ({
                    ...p,
                    category_name: p.category?.name || ''
                }));
                result = { success: true, data: products };
            } else if (method === 'POST') {
                const { data, error } = await supabase.from('products').insert([{
                    name: body.name,
                    model_number: body.model_number,
                    category_id: body.category_id || null,
                    sort_order: body.sort_order || 0,
                    short_desc: body.short_desc,
                    full_desc: body.full_desc,
                    main_image: body.main_image,
                    image_urls: body.image_urls,
                    is_featured: body.is_featured != null ? body.is_featured : 0,
                    is_active: body.is_active != null ? body.is_active : 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }]).select().single();
                if (error) throw error;
                result = { success: true, data, message: '产品创建成功！' };
            }
        }
        // GET/POST /banners
        else if (path === '/banners') {
            if (method === 'GET') {
                const { data, error } = await supabase.from('banners').select('*').order('sort_order');
                if (error) throw error;
                result = { success: true, data };
            } else if (method === 'POST') {
                const { data, error } = await supabase.from('banners').insert([{
                    title: body.title,
                    subtitle: body.subtitle,
                    image_url: body.image_url,
                    link_url: body.link_url,
                    sort_order: body.sort_order || 0,
                    is_active: 1,
                    created_at: new Date().toISOString()
                }]).select().single();
                if (error) throw error;
                result = { success: true, data, message: '轮播创建成功！' };
            }
        }
        // DELETE /banners/:id | PUT /banners/:id
        else if (/^\/banners\/\d+$/.test(path)) {
            const id = parseInt(path.split('/').pop());
            if (method === 'PUT') {
                const { error } = await supabase.from('banners').update({
                    title: body.title,
                    subtitle: body.subtitle,
                    image_url: body.image_url,
                    link_url: body.link_url,
                    sort_order: body.sort_order,
                    is_active: body.is_active != null ? body.is_active : 1,
                    updated_at: new Date().toISOString()
                }).eq('id', id);
                if (error) throw error;
                result = { success: true, message: '轮播更新成功！' };
            } else if (method === 'DELETE') {
                const { error } = await supabase.from('banners').delete().eq('id', id);
                if (error) throw error;
                result = { success: true, message: '轮播已删除' };
            }
        }
        // GET /news
        else if (path === '/news') {
            if (method === 'GET') {
                const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                result = { success: true, data };
            } else if (method === 'POST') {
                const { data, error } = await supabase.from('news').insert([{
                    title: body.title,
                    summary: body.summary,
                    content: body.content,
                    cover_image: body.cover_image,
                    is_active: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }]).select().single();
                if (error) throw error;
                result = { success: true, data, message: '新闻发布成功！' };
            }
        }
        // PUT /news/:id
        else if (/^\/news\/\d+$/.test(path)) {
            const id = parseInt(path.split('/').pop());
            if (method === 'PUT') {
                const { error } = await supabase.from('news').update({
                    title: body.title,
                    summary: body.summary,
                    content: body.content,
                    cover_image: body.cover_image,
                    is_active: body.is_active != null ? body.is_active : 1,
                    updated_at: new Date().toISOString()
                }).eq('id', id);
                if (error) throw error;
                result = { success: true, message: '新闻更新成功！' };
            } else if (method === 'DELETE') {
                const { error } = await supabase.from('news').delete().eq('id', id);
                if (error) throw error;
                result = { success: true, message: '新闻已删除' };
            }
        }
        // GET /messages
        else if (path === '/messages') {
            if (method === 'GET') {
                const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                result = { success: true, data };
            }
        }
        // PATCH /messages/:id/read
        else if (/^\/messages\/\d+\/read$/.test(path)) {
            const id = parseInt(path.split('/')[2]);
            if (method === 'PATCH') {
                const { error } = await supabase.from('messages').update({ status: 'read' }).eq('id', id);
                if (error) throw error;
                result = { success: true, message: '已标记为已读' };
            }
        }
        // DELETE /messages/:id
        else if (/^\/messages\/\d+$/.test(path)) {
            const id = parseInt(path.split('/').pop());
            if (method === 'DELETE') {
                const { error } = await supabase.from('messages').delete().eq('id', id);
                if (error) throw error;
                result = { success: true, message: '留言已删除' };
            }
        }
        // POST /login (handled by signInWithPassword below)
        else if (path === '/login') {
            // This path is handled by the login form directly
            result = { success: false, message: '请使用登录页面' };
        }
        // POST /logout
        else if (path === '/logout') {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            result = { success: true };
        }
        else {
            return { success: false, message: '未知 API 路径' };
        }

        return result;
    } catch (e) {
        console.error('API Error:', e);
        return { success: false, message: '操作失败: ' + (e.message || e) };
    }
}

// ==================== Supabase Storage Upload ====================
// 存储桶名: 'images'
const STORAGE_BUCKET = 'images';

async function uploadToStorage(file) {
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    
    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Upload error:', error);
        return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}

// ==================== Sidebar Navigation ====================
document.querySelectorAll('.sidebar-link[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        
        // Update active state
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Use showPage to switch pages AND load data
        if (typeof showPage === 'function') {
            showPage(page);
        } else {
            // Fallback: manual page switch
            document.querySelectorAll('.admin-page').forEach(p => p.style.display = 'none');
            const targetPage = document.getElementById(page);
            if (targetPage) targetPage.style.display = '';
            document.getElementById('page-title').textContent = link.textContent.trim();
        }
    });
});

// Mobile toggle
const mobileToggle = document.getElementById('mobile-toggle');
const sidebarEl = document.querySelector('.sidebar');
if (mobileToggle && sidebarEl) {
    mobileToggle.addEventListener('click', () => {
        sidebarEl.classList.toggle('open');
    });
}

// Logout
document.getElementById('logout-btn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
    window.location.href = 'login.html';
});

// ==================== Login Handler ====================
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = e.target.querySelector('button[type=submit]');
        btn.disabled = true;
        btn.textContent = '登录中...';

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            const errorEl = document.getElementById('login-error');

            if (error) {
                errorEl.textContent = error.message || '登录失败';
                errorEl.style.display = 'block';
                btn.disabled = false;
                btn.textContent = '登录';
            } else if (data.session) {
                window.location.href = './';
            } else {
                errorEl.textContent = '登录失败，请重试';
                errorEl.style.display = 'block';
                btn.disabled = false;
                btn.textContent = '登录';
            }
        } catch (err) {
            const errorEl = document.getElementById('login-error');
            errorEl.textContent = '网络错误: ' + err.message;
            errorEl.style.display = 'block';
            btn.disabled = false;
            btn.textContent = '登录';
        }
    });
}

// ==================== Dashboard Stats Load ====================
async function loadStats() {
    const res = await api('/stats');
    if (res.success) {
        const d = res.data;
        updateStat('stat-products', d.products);
        updateStat('stat-categories', d.categories);
        updateStat('stat-messages', d.unreadMessages);
        updateStat('stat-views', d.totalViews);
    }
}

function updateStat(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || 0;
}

// Initialize dashboard stats if on dashboard page
if (document.getElementById('dashboard-page')) {
    loadStats();
}

// ==================== Unified Page Editor Module ====================
// 统一首页编辑器：背景样式 + 内容管理 合二为一

// ── 预设渐变方案（用户友好的名称）──
const PRESET_GRADIENTS = [
    { id: 'brand',   name: '品牌蓝紫', css: 'linear-gradient(135deg, #1B2E5A 0%, #3A7BC8 100%)', stops: ['#1B2E5A', '#3A7BC8'] },
    { id: 'tech',    name: '科技渐变', css: 'linear-gradient(135deg, #0F1D3A 0%, #5B9BD5 100%)', stops: ['#0F1D3A', '#5B9BD5'] },
    { id: 'dark',    name: '深色优雅', css: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)', stops: ['#1E293B', '#334155'] },
    { id: 'custom',  name: '自定义',   css: '', stops: [] }
];

const SECTION_LIST = [
    { key: 'header',   label: '🧭 导航栏',   icon: '🧭', hasContent: false },
    { key: 'hero',     label: '🏠 首屏大图', icon: '🏠', hasContent: true },
    { key: 'banner',   label: '🎠 轮播区域', icon: '🎠', hasContent: false },
    { key: 'products', label: '📦 产品展示', icon: '📦', hasContent: false },
    { key: 'features', label: '⭐ 特色优势', icon: '⭐', hasContent: true },
    { key: 'categories',label:'📁 分类展示', icon: '📁', hasContent: false },
    { key: 'cta',      label: '📢 行动号召', icon: '📢', hasContent: true },
    { key: 'footer',   label: '📋 页脚区域', icon: '📋', hasContent: false },
    { key: 'body',     label: '📄 整体背景', icon: '📄', hasContent: false }
];

const COLOR_PRESETS = [
    '#1B2E5A', '#3A7BC8', '#0F1D3A', '#5B9BD5',
    '#f5f5f7', '#ffffff', '#F8FAFC', '#1E293B',
    '#22C55E', '#EF4444', '#F59E0B', '#8B5CF6',
    '#000000', '#334155', '#E2E8F0', '#DBEAFE'
];

let currentSection = 'hero';
let allStyles = {};
let siteConfig = null;       // site_config 内容数据
let featureCards = [];       // 特色卡片
let currentGradientStops = ['#1B2E5A', '#3A7BC8'];
let currentBgType = 'gradient';
let currentPresetId = 'brand';

// ==================== Main Entry ====================

async function loadEditor() {
    try {
        // 并行加载：背景配置 + 站点内容
        const [styleRes, configRes] = await Promise.all([
            supabase.from('section_backgrounds').select('*').order('sort_order'),
            supabase.from('site_config').select('*').single()
        ]);

        if (styleRes.error) throw styleRes.error;
        if (configRes.error) throw configRes.error;

        allStyles = {};
        if (styleRes.data) styleRes.data.forEach(s => { allStyles[s.section_key] = s; });
        siteConfig = configRes.data || {};

        // 渲染区域列表
        renderSectionTabs(styleRes.data);
        selectSection('hero');

        // 加载特色卡片
        await loadFeatureCards();
    } catch (e) {
        console.error('Editor load error:', e);
        toast('加载页面配置失败: ' + e.message, 'error');
    }
}

// ==================== Section Tabs ====================

function renderSectionTabs(data) {
    const container = document.getElementById('section-tabs');
    if (!container) return;

    const dataMap = {};
    if (data) data.forEach(s => { dataMap[s.section_key] = s; });

    container.innerHTML = SECTION_LIST.map(s => {
        const cfg = dataMap[s.key];
        const hasCustom = cfg && (
            cfg.bg_image ||
            (cfg.bg_type === 'color' && cfg.bg_color) ||
            (cfg.bg_type === 'gradient' && cfg.gradient_colors &&
             JSON.stringify(cfg.gradient_colors) !== '["#1B2E5A","#3A7BC8"]')
        );
        return `<div class="section-tab" data-key="${s.key}" onclick="selectSection('${s.key}')">
            <span>${s.icon}</span>
            <span>${s.label.replace(/^[^\u4e00-\u9fff]+/, '').trim()}</span>
            <span class="dot${hasCustom ? '' : ' hidden'}"></span>
        </div>`;
    }).join('');
}

// ==================== Section Selection ====================

function selectSection(key) {
    currentSection = key;
    const info = SECTION_LIST.find(s => s.key === key);

    // 更新左侧高亮
    document.querySelectorAll('.section-tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector(`.section-tab[data-key="${key}"]`);
    if (activeTab) activeTab.classList.add('active');

    // 更新标题
    document.getElementById('style-section-name').textContent = info ? info.label : key;

    // 渲染编辑面板
    const config = allStyles[key] || getDefaultStyle(key);
    currentBgType = config.bg_type || 'gradient';
    currentGradientStops = parseGradientColors(config.gradient_colors);

    // 判断当前使用的预设
    currentPresetId = 'custom';
    if (config.bg_type === 'gradient') {
        for (const p of PRESET_GRADIENTS) {
            if (p.stops.length && JSON.stringify(p.stops) === JSON.stringify(currentGradientStops)) {
                currentPresetId = p.id; break;
            }
        }
    }

    renderEditorForm(key, config);
    updateStylePreview();
}

function getDefaultStyle(key) {
    const defaults = {
        body:   { bg_type:'color', bg_color:'#ffffff', gradient_colors:'["#1B2E5A","#3A7BC8"]' },
        header: { bg_type:'color', bg_color:'rgba(255,255,255,0.82)', gradient_colors:'["#1B2E5A","#3A7BC8"]' },
        hero:   { bg_type:'gradient', gradient_colors:'["#1B2E5A","#3A7BC8"]', bg_color:'#1B2E5A' },
        banner: { bg_type:'color', bg_color:'#f5f5f7', gradient_colors:'["#1B2E5A","#3A7BC8"]' },
        products:{ bg_type:'color', bg_color:'#f5f5f7', gradient_colors:'["#1B2E5A","#3A7BC8"]' },
        features:{bg_type:'color', bg_color:'#ffffff', gradient_colors:'["#1B2E5A","#3A7BC8"]' },
        categories:{bg_type:'color', bg_color:'#f5f5f7', gradient_colors:'["#1B2E5A","#3A7BC8"]' },
        cta:    { bg_type:'gradient', gradient_colors:'["#1B2E5A","#3A7BC8"]', bg_color:'#1B2E5A' },
        footer: { bg_type:'color', bg_color:'#0F1D3A', gradient_colors:'["#1B2E5A","#3A7BC8"]' }
    };
    return {
        section_key: key,
        bg_type: (defaults[key] || {}).bg_type || 'gradient',
        bg_color: (defaults[key] || {}).bg_color || '#f5f5f7',
        gradient_type: 'linear',
        gradient_angle: 135,
        gradient_colors: (defaults[key] || {}).gradient_colors || '["#1B2E5A","#3A7BC8"]',
        bg_image: '', bg_size: 'cover', bg_position: 'center center', bg_repeat: 'no-repeat',
        bg_fixed: 0, overlay_color: '#000000', overlay_opacity: 0, custom_padding: ''
    };
}

function parseGradientColors(val) {
    if (!val) return ['#1B2E5A', '#3A7BC8'];
    try { const c = typeof val === 'string' ? JSON.parse(val) : val; return Array.isArray(c) ? c : ['#1B2E5A', '#3A7BC8']; }
    catch(e) { return ['#1B2E5A', '#3A7BC8']; }
}

// ==================== Render Editor Form ====================

function renderEditorForm(key, config) {
    const info = SECTION_LIST.find(s => s.key === key);
    const hasContent = info && info.hasContent;

    // 渲染 内容/文字/背景 tab 切换
    const tabBar = document.getElementById('editor-tab-bar');
    tabBar.innerHTML = `
        ${hasContent ? '<button class="editor-tab active" data-etab="content">✏️ 内容</button>' : ''}
        <button class="editor-tab${hasContent ? '' : ' active'}" data-etab="textstyle">🔤 文字</button>
        <button class="editor-tab" data-etab="background">🎨 背景</button>
    `;

    // Tab 点击事件
    tabBar.querySelectorAll('.editor-tab').forEach(btn => {
        btn.addEventListener('click', function() {
            tabBar.querySelectorAll('.editor-tab').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const panel = this.dataset.etab;
            document.getElementById('panel-content').style.display = panel === 'content' ? '' : 'none';
            document.getElementById('panel-textstyle').style.display = panel === 'textstyle' ? '' : 'none';
            document.getElementById('panel-background').style.display = panel === 'background' ? '' : 'none';
        });
    });

    // 渲染内容面板
    if (hasContent) renderContentPanel(key);
    document.getElementById('panel-content').style.display = hasContent ? '' : 'none';

    // 渲染文字样式面板
    renderTextStylePanel(key, config);
    document.getElementById('panel-textstyle').style.display = hasContent ? 'none' : '';

    // 渲染背景面板
    renderBackgroundPanel(key, config);
    document.getElementById('panel-background').style.display = 'none';
}

// ==================== Content Panel ====================

function renderContentPanel(key) {
    const panel = document.getElementById('panel-content');
    if (!panel) return;

    if (key === 'hero') {
        panel.innerHTML = `
            <div class="form-group">
                <label>主标题 <span class="hint">(换行用 \\n)</span></label>
                <input type="text" id="ec-hero-title" value="${escapeHtml(siteConfig.hero_title || '')}" placeholder="科技绿色\n服务生活">
            </div>
            <div class="form-group">
                <label>副标题</label>
                <input type="text" id="ec-hero-subtitle" value="${escapeHtml(siteConfig.hero_subtitle || '')}" placeholder="专业电梯配件 · 精工品质 · 值得信赖">
            </div>`;
    } else if (key === 'cta') {
        panel.innerHTML = `
            <div class="form-group">
                <label>标题</label>
                <input type="text" id="ec-cta-title" value="${escapeHtml(siteConfig.cta_title || '')}" placeholder="准备好开始合作了吗？">
            </div>
            <div class="form-group">
                <label>副标题</label>
                <input type="text" id="ec-cta-subtitle" value="${escapeHtml(siteConfig.cta_subtitle || '')}" placeholder="我们的专业团队随时为您提供技术咨询和报价服务">
            </div>
            <div class="form-group">
                <label>按钮文字</label>
                <input type="text" id="ec-cta-btn" value="${escapeHtml(siteConfig.cta_button_text || '')}" placeholder="立即联系 →">
            </div>`;
    } else if (key === 'features') {
        renderFeatureCardsList();
    }
}

// ==================== Feature Cards ====================

async function loadFeatureCards() {
    try {
        const { data, error } = await supabase.from('home_features').select('*').order('sort_order');
        if (error) throw error;
        featureCards = data || [];
        if (currentSection === 'features') renderFeatureCardsList();
    } catch (e) {
        console.error('Feature load error:', e);
        featureCards = [];
    }
}

function renderFeatureCardsList() {
    const panel = document.getElementById('panel-content');
    if (!panel) return;

    if (featureCards.length === 0) {
        panel.innerHTML = `
            <div style="text-align:center;padding:32px;color:#94A3B8;">
                <div style="font-size:40px;margin-bottom:8px;">⭐</div>
                <p>还没有特色卡片</p>
                <p style="font-size:12px;">点击下方按钮添加首页特色优势卡片</p>
            </div>
            <button class="btn-admin btn--primary btn--sm" onclick="openFeatureModal()" style="margin-top:12px;">+ 添加卡片</button>`;
        return;
    }

    panel.innerHTML = featureCards.map((f, i) => `
        <div class="feature-card-editor">
            <div class="feature-card-icon">${escapeHtml(f.icon || '⭐')}</div>
            <div class="feature-card-info">
                <strong>${escapeHtml(f.title || '未命名')}</strong>
                <span>${escapeHtml((f.description || '').substring(0, 50))}</span>
            </div>
            <div style="display:flex;gap:6px;">
                <button class="btn-admin btn--sm btn--outline" onclick="openFeatureModal('${f.id}')">编辑</button>
                <button class="btn-admin btn--sm btn--danger" onclick="deleteFeatureCard('${f.id}')">删除</button>
            </div>
        </div>
    `).join('')
        + `<button class="btn-admin btn--primary btn--sm" onclick="openFeatureModal()" style="margin-top:12px;">+ 添加卡片</button>`;
}

function openFeatureModal(id) {
    const modal = document.getElementById('feature-modal');
    if (!modal) return;
    document.getElementById('feat-id').value = '';

    if (id) {
        const f = featureCards.find(c => c.id == id);
        if (f) {
            document.getElementById('feat-id').value = f.id;
            document.getElementById('feat-icon').value = f.icon || '⭐';
            document.getElementById('feat-title').value = f.title || '';
            document.getElementById('feat-desc').value = f.description || '';
            document.getElementById('feat-sort').value = f.sort_order || 0;
            document.getElementById('feat-active').checked = f.is_active !== 0;
        }
    } else {
        document.getElementById('feat-icon').value = '⭐';
        document.getElementById('feat-title').value = '';
        document.getElementById('feat-desc').value = '';
        document.getElementById('feat-sort').value = featureCards.length + 1;
        document.getElementById('feat-active').checked = true;
    }
    modal.style.display = 'flex';
}

function closeFeatureModal() {
    const modal = document.getElementById('feature-modal');
    if (modal) modal.style.display = 'none';
}

async function saveFeatureCard(e) {
    e.preventDefault();
    const id = document.getElementById('feat-id').value;
    const payload = {
        icon: document.getElementById('feat-icon').value || '⭐',
        title: document.getElementById('feat-title').value,
        description: document.getElementById('feat-desc').value,
        sort_order: parseInt(document.getElementById('feat-sort').value) || 0,
        is_active: document.getElementById('feat-active').checked ? 1 : 0,
        updated_at: new Date().toISOString()
    };

    try {
        let res;
        if (id) {
            res = await supabase.from('home_features').update(payload).eq('id', id);
        } else {
            payload.created_at = new Date().toISOString();
            res = await supabase.from('home_features').insert([payload]);
        }
        if (res.error) throw res.error;
        toast(id ? '卡片已更新' : '卡片已创建');
        closeFeatureModal();
        await loadFeatureCards();
    } catch (e) {
        toast('操作失败: ' + (e.message || e), 'error');
    }
}

async function deleteFeatureCard(id) {
    if (!confirm('确定删除这张特色卡片吗？')) return;
    try {
        const { error } = await supabase.from('home_features').delete().eq('id', id);
        if (error) throw error;
        toast('卡片已删除');
        await loadFeatureCards();
    } catch (e) {
        toast('删除失败: ' + (e.message || e), 'error');
    }
}

// ==================== Text Style Panel ====================

function getTextStyle(config) {
    if (config && config.text_style) {
        try { return typeof config.text_style === 'string' ? JSON.parse(config.text_style) : config.text_style; }
        catch(e) {}
    }
    return { color: '', headingColor: '', size: '', align: '', weight: '', fontFamily: '', lineHeight: '', letterSpacing: '' };
}

function renderTextStylePanel(key, config) {
    const panel = document.getElementById('panel-textstyle');
    if (!panel) return;
    const ts = getTextStyle(config);

    panel.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>字体</label>
                <select id="ts-font" onchange="applyTextStylePreview()">
                    <option value="">系统默认</option>
                    <option value="'PingFang SC','Microsoft YaHei',sans-serif" ${ts.fontFamily==="'PingFang SC','Microsoft YaHei',sans-serif"?'selected':''}>苹方 / 微软雅黑</option>
                    <option value="'SimSun','STSong',serif" ${ts.fontFamily==="'SimSun','STSong',serif"?'selected':''}>宋体</option>
                    <option value="'SimHei','STHeiti',sans-serif" ${ts.fontFamily==="'SimHei','STHeiti',sans-serif"?'selected':''}>黑体</option>
                    <option value="'KaiTi','STKaiti',serif" ${ts.fontFamily==="'KaiTi','STKaiti',serif"?'selected':''}>楷体</option>
                    <option value="Georgia,'Times New Roman',serif" ${ts.fontFamily==="Georgia,'Times New Roman',serif"?'selected':''}>衬线英文</option>
                </select>
            </div>
            <div class="form-group">
                <label>字重</label>
                <select id="ts-weight" onchange="applyTextStylePreview()">
                    <option value="">默认</option>
                    <option value="300" ${ts.weight==='300'?'selected':''}>细体</option>
                    <option value="400" ${ts.weight==='400'?'selected':''}>常规</option>
                    <option value="600" ${ts.weight==='600'?'selected':''}>半粗</option>
                    <option value="700" ${ts.weight==='700'?'selected':''}>粗体</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>标题颜色</label>
                <div style="display:flex;align-items:center;gap:8px;">
                    <input type="color" id="ts-heading-color" value="${ts.headingColor || '#ffffff'}" style="width:40px;height:34px;padding:2px;border-radius:6px;cursor:pointer;" onchange="applyTextStylePreview()">
                    <input type="text" id="ts-heading-color-text" value="${ts.headingColor || '#ffffff'}" style="width:90px;font-size:13px;" onchange="applyTextStylePreview()" placeholder="#ffffff">
                </div>
            </div>
            <div class="form-group">
                <label>正文颜色</label>
                <div style="display:flex;align-items:center;gap:8px;">
                    <input type="color" id="ts-text-color" value="${ts.color || '#ffffff'}" style="width:40px;height:34px;padding:2px;border-radius:6px;cursor:pointer;" onchange="applyTextStylePreview()">
                    <input type="text" id="ts-text-color-text" value="${ts.color || '#ffffff'}" style="width:90px;font-size:13px;" onchange="applyTextStylePreview()" placeholder="#ffffff">
                </div>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>字体大小</label>
                <select id="ts-size" onchange="applyTextStylePreview()">
                    <option value="">默认</option>
                    <option value="14px" ${ts.size==='14px'?'selected':''}>小 (14px)</option>
                    <option value="16px" ${ts.size==='16px'?'selected':''}>标准 (16px)</option>
                    <option value="18px" ${ts.size==='18px'?'selected':''}>大 (18px)</option>
                    <option value="20px" ${ts.size==='20px'?'selected':''}>特大 (20px)</option>
                    <option value="24px" ${ts.size==='24px'?'selected':''}>超大 (24px)</option>
                </select>
            </div>
            <div class="form-group">
                <label>行高</label>
                <select id="ts-lineheight" onchange="applyTextStylePreview()">
                    <option value="">默认</option>
                    <option value="1.4" ${ts.lineHeight==='1.4'?'selected':''}>紧凑 (1.4)</option>
                    <option value="1.6" ${ts.lineHeight==='1.6'?'selected':''}>标准 (1.6)</option>
                    <option value="1.8" ${ts.lineHeight==='1.8'?'selected':''}>舒适 (1.8)</option>
                    <option value="2.0" ${ts.lineHeight==='2.0'?'selected':''}>宽松 (2.0)</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>字间距</label>
                <select id="ts-letterspacing" onchange="applyTextStylePreview()">
                    <option value="">默认</option>
                    <option value="0.5px" ${ts.letterSpacing==='0.5px'?'selected':''}>微宽 (0.5px)</option>
                    <option value="1px" ${ts.letterSpacing==='1px'?'selected':''}>略宽 (1px)</option>
                    <option value="2px" ${ts.letterSpacing==='2px'?'selected':''}>宽松 (2px)</option>
                </select>
            </div>
            <div class="form-group">
                <label>对齐方式</label>
                <div style="display:flex;gap:4px;">
                    <button class="ts-align-btn${(ts.align||'left')==='left'?' active':''}" data-ts-align="left" title="左对齐">⬅️</button>
                    <button class="ts-align-btn${ts.align==='center'?' active':''}" data-ts-align="center" title="居中">⬆️</button>
                    <button class="ts-align-btn${ts.align==='right'?' active':''}" data-ts-align="right" title="右对齐">➡️</button>
                </div>
            </div>
        </div>
    `;

    // 对齐按钮事件
    panel.querySelectorAll('.ts-align-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            panel.querySelectorAll('.ts-align-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            applyTextStylePreview();
        });
    });

    // 初始应用
    applyTextStylePreview();
}

function applyTextStylePreview() {
    const ts = readTextStyleFromForm();
    const box = document.getElementById('style-preview-box');
    if (!box) return;
    if (ts.fontFamily) box.style.fontFamily = ts.fontFamily;
    if (ts.color) box.style.color = ts.color;
    if (ts.size) box.style.fontSize = ts.size;
    if (ts.align) box.style.textAlign = ts.align;
    if (ts.weight) box.style.fontWeight = ts.weight;
    if (ts.lineHeight) box.style.lineHeight = ts.lineHeight;
    if (ts.letterSpacing) box.style.letterSpacing = ts.letterSpacing;
    updateStylePreview();
}

function readTextStyleFromForm() {
    return {
        fontFamily: document.getElementById('ts-font')?.value || '',
        color: document.getElementById('ts-text-color-text')?.value || document.getElementById('ts-text-color')?.value || '',
        headingColor: document.getElementById('ts-heading-color-text')?.value || document.getElementById('ts-heading-color')?.value || '',
        size: document.getElementById('ts-size')?.value || '',
        lineHeight: document.getElementById('ts-lineheight')?.value || '',
        letterSpacing: document.getElementById('ts-letterspacing')?.value || '',
        align: document.querySelector('.ts-align-btn.active')?.dataset?.tsAlign || 'left',
        weight: document.getElementById('ts-weight')?.value || ''
    };
}

// ==================== Background Panel ====================

function renderBackgroundPanel(key, config) {
    const panel = document.getElementById('panel-background');
    if (!panel) return;

    const bgType = config.bg_type || 'gradient';

    panel.innerHTML = `
        <div class="form-group">
            <label>背景类型</label>
            <div class="editor-bg-type-tabs">
                <button class="ebt-btn${bgType === 'gradient' ? ' active' : ''}" data-ebt="gradient">🌈 渐变</button>
                <button class="ebt-btn${bgType === 'color' ? ' active' : ''}" data-ebt="color">🎨 纯色</button>
                <button class="ebt-btn${bgType === 'image' ? ' active' : ''}" data-ebt="image">🖼️ 图片</button>
            </div>
        </div>

        <!-- 渐变面板 -->
        <div id="eb-panel-gradient" style="display:${bgType === 'gradient' ? '' : 'none'};">
            <div class="form-group">
                <label>渐变方案</label>
                <div class="preset-gradient-grid" id="preset-gradient-grid">
                    ${PRESET_GRADIENTS.map(p => `
                        <div class="preset-gradient-card${currentPresetId === p.id ? ' active' : ''}" data-preset="${p.id}" style="background:${p.css || '#e2e8f0'};">
                            <span>${p.name}</span>
                            ${currentPresetId === p.id ? '<span class="check">✓</span>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div id="custom-gradient-panel" style="display:${currentPresetId === 'custom' ? '' : 'none'};">
                <label>自定义色标</label>
                <div id="gradient-stops"></div>
                <button type="button" class="btn-admin btn--sm btn--outline" id="add-gradient-stop" style="margin-top:8px;">+ 添加色标</button>
                <div id="gradient-preview-bar" style="height:28px;border-radius:8px;margin-top:12px;border:1px solid #E2E8F0;"></div>
            </div>
        </div>

        <!-- 纯色面板 -->
        <div id="eb-panel-color" style="display:${bgType === 'color' ? '' : 'none'};">
            <div class="form-group">
                <label>选择颜色</label>
                <div style="display:flex;align-items:center;gap:10px;">
                    <input type="color" id="bg-color-picker" value="${config.bg_color || '#f5f5f7'}" style="width:48px;height:38px;padding:2px;border-radius:6px;cursor:pointer;">
                    <input type="text" id="bg-color-text" value="${config.bg_color || '#f5f5f7'}" style="width:100px;" placeholder="#f5f5f7">
                </div>
            </div>
            <div class="form-group">
                <label>预设品牌色</label>
                <div id="color-presets" style="display:flex;flex-wrap:wrap;gap:6px;">
                    ${COLOR_PRESETS.map(c => `<div class="color-preset" style="background:${c};" onclick="pickPresetColor('${c}')" title="${c}"></div>`).join('')}
                </div>
            </div>
        </div>

        <!-- 图片面板 -->
        <div id="eb-panel-image" style="display:${bgType === 'image' ? '' : 'none'};">
            <div class="form-group">
                <label>上传背景图</label>
                <input type="file" id="style-bg-file" accept="image/*" onchange="previewStyleBg(this)">
            </div>
            <div class="form-group">
                <label>或输入图片URL</label>
                <input type="text" id="bg-image-url" value="${escapeHtml(config.bg_image || '')}" placeholder="https://...">
            </div>
            <div id="style-bg-preview" style="display:${config.bg_image ? '' : 'none'};margin-bottom:12px;">
                <img src="${escapeHtml(config.bg_image || '')}" style="max-width:100%;max-height:200px;border-radius:8px;border:1px solid #E2E8F0;">
            </div>
        </div>

        <!-- 叠加层 -->
        <div class="form-group" style="border-top:1px solid #E2E8F0;padding-top:16px;margin-top:16px;">
            <label>遮罩层 <span class="hint">(让文字更清晰)</span></label>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <input type="color" id="bg-overlay-color" value="${config.overlay_color || '#000000'}" style="width:40px;height:32px;padding:1px;border-radius:4px;">
                <span style="font-size:13px;color:#64748B;">透明度</span>
                <input type="range" id="bg-overlay-opacity" min="0" max="100" value="${Math.round((config.overlay_opacity || 0) * 100)}" style="width:100px;">
                <span id="overlay-opacity-val" style="font-size:13px;font-weight:600;">${Math.round((config.overlay_opacity || 0) * 100)}%</span>
            </div>
        </div>
    `;

    // 渲染渐变色标
    if (bgType === 'gradient') {
        renderGradientStops(currentGradientStops);
        updateGradientBar();
    }
}

// ==================== Gradient Stops ====================

function renderGradientStops(colors) {
    const container = document.getElementById('gradient-stops');
    if (!container) return;
    container.innerHTML = colors.map((color, i) => `
        <div class="gradient-stop-row">
            <span style="font-size:13px;color:#64748B;min-width:20px;">${i + 1}</span>
            <input type="color" value="${color}" onchange="updateGradientStop(${i}, this.value)">
            <input type="text" value="${color}" onchange="updateGradientStop(${i}, this.value)" placeholder="#色值">
            ${colors.length > 2 ? `<button type="button" class="btn-remove-stop" onclick="removeGradientStop(${i})" title="删除">×</button>` : ''}
        </div>
    `).join('');
    const addBtn = document.getElementById('add-gradient-stop');
    if (addBtn) addBtn.style.display = colors.length >= 4 ? 'none' : '';
    updateGradientBar();
}

function updateGradientStop(index, value) {
    currentGradientStops[index] = value;
    currentPresetId = 'custom';
    updateGradientBar();
    updateStylePreview();
    // 更新预设选中状态
    document.querySelectorAll('.preset-gradient-card').forEach(c => c.classList.remove('active'));
    document.querySelector('.preset-gradient-card[data-preset="custom"]')?.classList.add('active');
    document.getElementById('custom-gradient-panel').style.display = '';
}

function removeGradientStop(index) {
    if (currentGradientStops.length <= 2) return;
    currentGradientStops.splice(index, 1);
    renderGradientStops(currentGradientStops);
    updateStylePreview();
}

function addGradientStop() {
    if (currentGradientStops.length >= 4) return;
    currentGradientStops.splice(Math.floor(currentGradientStops.length / 2), 0, '#5B9BD5');
    renderGradientStops(currentGradientStops);
    updateStylePreview();
}

function updateGradientBar() {
    const bar = document.getElementById('gradient-preview-bar');
    if (!bar) return;
    bar.style.backgroundImage = `linear-gradient(135deg, ${currentGradientStops.join(', ')})`;
}

// ==================== Color ====================

function pickPresetColor(color) {
    const picker = document.getElementById('bg-color-picker');
    const text = document.getElementById('bg-color-text');
    if (picker) picker.value = color;
    if (text) text.value = color;
    currentBgType = 'color';
    updateStylePreview();
}

// ==================== Image Preview ====================

function previewStyleBg(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) { showStyleBgPreview(e.target.result); };
    reader.readAsDataURL(file);
}

function showStyleBgPreview(url) {
    const preview = document.getElementById('style-bg-preview');
    const img = preview ? preview.querySelector('img') : null;
    if (img) img.src = url;
    if (preview) preview.style.display = '';
}

function hideStyleBgPreview() {
    const preview = document.getElementById('style-bg-preview');
    if (preview) preview.style.display = 'none';
}

// ==================== Preview ====================

function updateStylePreview() {
    const box = document.getElementById('style-preview-box');
    if (!box) return;

    const bgType = currentBgType;

    // 显示区域名称
    const info = SECTION_LIST.find(s => s.key === currentSection);
    box.textContent = (info ? info.label : currentSection) + ' · 预览';

    switch (bgType) {
        case 'color': {
            const val = document.getElementById('bg-color-text')?.value || document.getElementById('bg-color-picker')?.value || '#f5f5f7';
            box.style.background = val;
            box.style.backgroundImage = 'none';
            box.style.color = isDarkColor(val) ? '#fff' : '#1E293B';
            box.style.textShadow = isDarkColor(val) ? '0 2px 8px rgba(0,0,0,0.3)' : 'none';
            break;
        }
        case 'image': {
            const url = document.getElementById('bg-image-url')?.value;
            if (url) {
                box.style.background = '';
                box.style.backgroundImage = `url(${url})`;
                box.style.backgroundSize = 'cover';
                box.style.backgroundPosition = 'center center';
            }
            box.style.color = '#fff';
            box.style.textShadow = '0 2px 8px rgba(0,0,0,0.3)';
            break;
        }
        case 'gradient':
        default: {
            const stops = currentGradientStops.join(', ');
            box.style.backgroundImage = `linear-gradient(135deg, ${stops})`;
            box.style.background = '';
            box.style.color = '#fff';
            box.style.textShadow = '0 2px 8px rgba(0,0,0,0.3)';
            break;
        }
    }

    // 叠加层模拟
    const ovColor = document.getElementById('bg-overlay-color')?.value || '#000000';
    const ovOpacity = parseInt(document.getElementById('bg-overlay-opacity')?.value || '0') / 100;
    box.style.boxShadow = ovOpacity > 0
        ? `inset 0 0 0 2000px ${hexToRgba(ovColor, ovOpacity)}`
        : 'none';
}

function isDarkColor(hex) {
    if (!hex || hex.length < 7) return true;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

function hexToRgba(hex, alpha) {
    if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

// ==================== Save & Reset ====================

async function saveEditorSection() {
    const key = currentSection;
    const info = SECTION_LIST.find(s => s.key === key);

    try {
        // 1. 保存内容（如果有内容面板）
        if (info && info.hasContent) {
            const contentData = {};
            if (key === 'hero') {
                contentData.hero_title = document.getElementById('ec-hero-title')?.value || '';
                contentData.hero_subtitle = document.getElementById('ec-hero-subtitle')?.value || '';
            } else if (key === 'cta') {
                contentData.cta_title = document.getElementById('ec-cta-title')?.value || '';
                contentData.cta_subtitle = document.getElementById('ec-cta-subtitle')?.value || '';
                contentData.cta_button_text = document.getElementById('ec-cta-btn')?.value || '';
            }
            if (Object.keys(contentData).length > 0) {
                const { error } = await supabase.from('site_config').update({
                    ...contentData,
                    updated_at: new Date().toISOString()
                }).eq('id', 1);
                if (error) throw error;
                // 更新本地缓存
                Object.assign(siteConfig, contentData);
            }
        }

        // 2. 保存背景
        const bgConfig = {
            section_key: key,
            section_label: info ? info.label : key,
            bg_type: currentBgType,
            is_active: 1,
            bg_color: document.getElementById('bg-color-text')?.value || document.getElementById('bg-color-picker')?.value || '#f5f5f7',
            gradient_type: 'linear',
            gradient_angle: 135,
            gradient_shape: 'circle',
            gradient_position: 'center',
            gradient_colors: JSON.stringify(currentGradientStops),
            text_style: JSON.stringify(readTextStyleFromForm()),
            bg_image: document.getElementById('bg-image-url')?.value || null,
            bg_size: 'cover',
            bg_position: 'center center',
            bg_repeat: 'no-repeat',
            bg_fixed: 0,
            overlay_color: document.getElementById('bg-overlay-color')?.value || '#000000',
            overlay_opacity: parseInt(document.getElementById('bg-overlay-opacity')?.value || '0') / 100,
            custom_padding: null
        };

        // 处理图片上传
        const fileInput = document.getElementById('style-bg-file');
        if (currentBgType === 'image' && fileInput && fileInput.files.length > 0) {
            toast('正在上传背景图...', 'info');
            const url = await uploadToStorage(fileInput.files[0]);
            if (url) {
                bgConfig.bg_image = url;
                document.getElementById('bg-image-url').value = url;
                showStyleBgPreview(url);
            } else {
                toast('上传失败，请重试', 'error');
                return;
            }
        }

        const { error } = await supabase.from('section_backgrounds')
            .upsert({ ...bgConfig, updated_at: new Date().toISOString() }, { onConflict: 'section_key' });
        if (error) throw error;

        allStyles[key] = bgConfig;
        renderSectionTabs(Object.values(allStyles));
        toast('✅ 保存成功！刷新前台即可看到效果');
    } catch (e) {
        console.error('Save editor error:', e);
        toast('保存失败: ' + e.message, 'error');
    }
}

async function resetEditorSection() {
    const key = currentSection;
    const info = SECTION_LIST.find(s => s.key === key);
    if (!confirm(`确定要将「${info ? info.label : key}」恢复为默认设置吗？`)) return;

    try {
        const { error } = await supabase.from('section_backgrounds').delete().eq('section_key', key);
        if (error) throw error;
        delete allStyles[key];
        renderSectionTabs(Object.values(allStyles));
        selectSection(key);
        toast('✅ 已恢复默认');
    } catch (e) {
        console.error('Reset error:', e);
        toast('重置失败: ' + e.message, 'error');
    }
}

// ==================== Event Binding ====================

function initEditorModule() {
    // 背景类型切换
    document.querySelectorAll('.ebt-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.ebt-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentBgType = this.dataset.ebt;
            document.getElementById('eb-panel-gradient').style.display = currentBgType === 'gradient' ? '' : 'none';
            document.getElementById('eb-panel-color').style.display = currentBgType === 'color' ? '' : 'none';
            document.getElementById('eb-panel-image').style.display = currentBgType === 'image' ? '' : 'none';
            updateStylePreview();
        });
    });

    // 预设渐变选择
    document.querySelectorAll('.preset-gradient-card').forEach(card => {
        card.addEventListener('click', function() {
            const presetId = this.dataset.preset;
            currentPresetId = presetId;
            const preset = PRESET_GRADIENTS.find(p => p.id === presetId);
            document.querySelectorAll('.preset-gradient-card').forEach(c => {
                c.classList.remove('active');
                c.querySelector('.check')?.remove();
            });
            this.classList.add('active');
            this.insertAdjacentHTML('beforeend', '<span class="check">✓</span>');
            
            if (preset && preset.stops.length > 0) {
                currentGradientStops = [...preset.stops];
                document.getElementById('custom-gradient-panel').style.display = 'none';
            } else {
                document.getElementById('custom-gradient-panel').style.display = '';
            }
            renderGradientStops(currentGradientStops);
            updateStylePreview();
        });
    });

    // 叠加层
    const overlayOp = document.getElementById('bg-overlay-opacity');
    if (overlayOp) {
        overlayOp.addEventListener('input', function() {
            const val = document.getElementById('overlay-opacity-val');
            if (val) val.textContent = this.value + '%';
            updateStylePreview();
        });
    }
    const overlayColor = document.getElementById('bg-overlay-color');
    if (overlayColor) overlayColor.addEventListener('input', updateStylePreview);

    // 颜色同步
    const colorPicker = document.getElementById('bg-color-picker');
    const colorText = document.getElementById('bg-color-text');
    if (colorPicker && colorText) {
        colorPicker.addEventListener('input', function() { colorText.value = this.value; updateStylePreview(); });
        colorText.addEventListener('input', function() {
            if (/^#[0-9a-fA-F]{6}$/.test(this.value)) { colorPicker.value = this.value; updateStylePreview(); }
        });
    }

    // 图片URL变化
    const imgUrl = document.getElementById('bg-image-url');
    if (imgUrl) imgUrl.addEventListener('input', updateStylePreview);

    // 添加色标
    const addStopBtn = document.getElementById('add-gradient-stop');
    if (addStopBtn) addStopBtn.addEventListener('click', addGradientStop);
}

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEditorModule);
} else {
    initEditorModule();
}
