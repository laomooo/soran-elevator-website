// ==================== 全局工具 ====================

// HTML 转义（防 XSS）
function escapeHtml(str) {
    if (!str && str !== 0) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

// fetchAPI 已改为使用 Supabase Client
// 前端页面通过 supabase 全局变量直接调用 Supabase API
// 为了方便兼容，保留 fetchAPI 包装函数
async function fetchAPI(path, options = {}) {
    // path 格式: /config, /categories, /products/featured/8, /products?page=1&limit=12, /banners, /messages
    // 根据路径映射到 Supabase 查询
    try {
        let result;

        // GET /config
        if (path === '/config') {
            const { data, error } = await supabase
                .from('site_config')
                .select('*')
                .single();
            if (error) throw error;
            result = { success: true, data };
        }
        // GET /categories
        else if (path === '/categories') {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('is_active', 1)
                .order('sort_order');
            if (error) throw error;
            result = { success: true, data };
        }
        // GET /products/featured/:limit
        else if (path.startsWith('/products/featured/')) {
            const limit = parseInt(path.split('/').pop()) || 8;
            const { data, error } = await supabase
                .from('products')
                .select('*, category:categories(name)')
                .eq('is_featured', 1)
                .eq('is_active', 1)
                .order('sort_order')
                .limit(limit);
            if (error) throw error;
            // Flatten category name
            const products = (data || []).map(p => ({
                ...p,
                category_name: p.category?.name || ''
            }));
            result = { success: true, data: products };
        }
        // GET /products/:id
        else if (/^\/products\/\d+$/.test(path)) {
            const id = parseInt(path.split('/').pop());
            const { data, error } = await supabase
                .from('products')
                .select('*, category:categories(name)')
                .eq('id', id)
                .single();
            if (error) throw error;
            if (data) {
                data.category_name = data.category?.name || '';
            }
            result = { success: true, data };
        }
        // GET /products?page=&limit=&category=
        else if (path.startsWith('/products')) {
            const urlParams = new URLSearchParams(path.split('?')[1] || '');
            const page = parseInt(urlParams.get('page')) || 1;
            const limit = parseInt(urlParams.get('limit')) || 12;
            const category = urlParams.get('category');
            const offset = (page - 1) * limit;

            let query = supabase
                .from('products')
                .select('*, category:categories(name)', { count: 'exact' })
                .eq('is_active', 1)
                .order('sort_order')
                .range(offset, offset + limit - 1);

            if (category && category !== 'all') {
                query = query.eq('category_id', parseInt(category));
            }

            const { data, error, count } = await query;
            if (error) throw error;

            const products = (data || []).map(p => ({
                ...p,
                category_name: p.category?.name || ''
            }));

            const totalPages = Math.ceil(count / limit);
            result = {
                success: true,
                data: products,
                pagination: { current: page, limit, total: count, totalPages }
            };
        }
        // GET /banners
        else if (path === '/banners') {
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .eq('is_active', 1)
                .order('sort_order');
            if (error) throw error;
            result = { success: true, data };
        }
        // POST /messages
        else if (path === '/messages' && options.method === 'POST') {
            const body = JSON.parse(options.body);
            const { data, error } = await supabase
                .from('messages')
                .insert([{
                    name: body.name,
                    phone: body.phone,
                    email: body.email,
                    company: body.company,
                    subject: body.subject,
                    content: body.content,
                    status: 'unread'
                }])
                .select()
                .single();
            if (error) throw error;
            result = { success: true, data, message: '留言提交成功！' };
        }
        else {
            return { success: false, message: '未知的 API 路径: ' + path };
        }

        return result;
    } catch (e) {
        console.error('Supabase API Error:', e);
        return { success: false, message: '网络请求失败: ' + (e.message || e) };
    }
}

function showToast(message, duration = 3000) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

// ==================== Header 滚动效果 & 移动端菜单 ====================
const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // Mobile menu toggle
    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            const isOpen = !menuToggle.classList.contains('open');
            menuToggle.classList.toggle('open');
            mobileNav.classList.toggle('show');
            menuToggle.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('open');
                mobileNav.classList.remove('show');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    // Set active nav (match by pathname ending)
    const currentPath = location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.header-nav a, .mobile-nav a').forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;
        // Normalize: './' → '/', 'about.html' → '/about.html'
        const normalized = href.replace(/^\.?\//, '/');
        if (currentPath.endsWith(normalized) || 
            (normalized === '/' && (currentPath === '/' || currentPath.endsWith('/index.html')))) {
            a.classList.add('active');
        }
    });
}

// ==================== 滚动动画（IntersectionObserver）====================
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

// ==================== 轮播图组件 ====================
class BannerCarousel {
    constructor(container, slides) {
        this.container = container;
        this.slides = slides;
        this.current = 0;
        this.timer = null;
        this.init();
    }

    init() {
        this.render();
        this.startAutoPlay();
    }

    render() {
        if (!this.container) return;
        
        let html = '';
        this.slides.forEach((slide, i) => {
            html += `
                <div class="banner-slide ${i === 0 ? 'active' : ''}">
                    <img src="${slide.image_url}" alt="${slide.title}" loading="${i === 0 ? 'eager' : 'lazy'}">
                    <div class="banner-overlay">
                        ${slide.title ? `<h2 class="text-subtitle">${slide.title}</h2>` : ''}
                        ${slide.subtitle ? `<p>${slide.subtitle}</p>` : ''}
                    </div>
                </div>`;
        });
        
        html += `<div class="banner-dots">
            ${this.slides.map((_, i) => `<button class="banner-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`).join('')}
        </div>`;

        this.container.innerHTML = html;

        // Dot events
        this.container.querySelectorAll('.banner-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                this.goTo(parseInt(e.target.dataset.index));
            });
        });
    }

    goTo(index) {
        const slidesEl = this.container.querySelectorAll('.banner-slide');
        const dots = this.container.querySelectorAll('.banner-dot');
        
        slidesEl[this.current]?.classList.remove('active');
        dots[this.current]?.classList.remove('active');

        this.current = index;
        slidesEl[this.current]?.classList.add('active');
        dots[this.current]?.classList.add('active');

        // Reset auto play timer
        clearInterval(this.timer);
        this.startAutoPlay();
    }

    next() {
        this.goTo((this.current + 1) % this.slides.length);
    }

    startAutoPlay() {
        if (this.slides.length <= 1) return;
        this.timer = setInterval(() => this.next(), 5000);
    }
}

// ==================== 产品卡片渲染 ====================
function renderProductCards(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📦</div>
                <p>暂无产品数据</p>
            </div>`;
        return;
    }

    container.innerHTML = products.map(p => `
        <a href="product-detail.html?id=${p.id}" class="product-card fade-in">
            <div class="product-card__image">
                <img src="${p.main_image || 'https://via.placeholder.com/600x450?text=SORAN'}" alt="${p.name}"
                     loading="lazy" onerror="this.src='https://via.placeholder.com/600x450?text=SORAN'">
                ${p.is_featured ? '<span class="product-card__badge">推荐</span>' : ''}
            </div>
            <div class="product-card__info">
                <span class="product-card__category">${p.category_name || ''}</span>
                <h3 class="product-card__name">${p.name}</h3>
                ${p.model_number ? `<p class="product-card__model">${p.model_number}</p>` : ''}
                <p class="product-card__desc">${p.short_desc || p.short_desc_en || ''}</p>
            </div>
        </a>
    `).join('');

    // Re-observe for animations
    container.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));
}
