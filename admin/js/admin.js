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
                if (body.cta_title !== undefined) updateData.cta_title = body.cta_title;
                if (body.cta_subtitle !== undefined) updateData.cta_subtitle = body.cta_subtitle;
                if (body.cta_button_text !== undefined) updateData.cta_button_text = body.cta_button_text;
                
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
