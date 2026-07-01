/**
 * SORAN 全页面背景渲染器
 * 从 Supabase section_backgrounds 表加载配置并动态应用背景样式
 * 优先级：section_backgrounds > site_config 旧字段 > CSS 默认值
 */
(function () {
    'use strict';

    // ==================== 核心函数 ====================

    /**
     * 主入口：加载并应用所有 section 背景
     * 在 DOMContentLoaded 时调用
     */
    async function applySectionBackgrounds() {
        if (typeof window.supabase === 'undefined') return;

        try {
            const { data, error } = await window.supabase
                .from('section_backgrounds')
                .select('*')
                .eq('is_active', 1);

            if (error || !data || data.length === 0) return;

            data.forEach(function (config) {
                applySingleBackground(config);
            });
        } catch (e) {
            console.warn('Background renderer: failed to load section styles', e.message);
        }
    }

    /**
     * 为单个 section 应用背景样式
     */
    function applySingleBackground(config) {
        var el = getSectionElement(config.section_key);
        if (!el) return;

        var css = buildBackgroundCSS(config);
        if (css) {
            el.style.cssText += ';' + css;
        }

        // 自定义内边距
        if (config.custom_padding) {
            el.style.padding = config.custom_padding;
        }

        // 叠加层
        if (config.overlay_color && parseFloat(config.overlay_opacity) > 0) {
            applyOverlay(el, config.overlay_color, parseFloat(config.overlay_opacity));
        }

        // 应用文字样式
        applyTextStyle(el, config);
    }

    /**
     * 应用文字样式到区域的标题和正文
     */
    function applyTextStyle(el, config) {
        var ts = null;
        if (config.text_style) {
            try { ts = typeof config.text_style === 'string' ? JSON.parse(config.text_style) : config.text_style; }
            catch(e) { return; }
        }
        if (!ts) return;

        // 标题颜色（含所有标题级别 + 自定义类）
        if (ts.headingColor) {
            var headings = el.querySelectorAll('h1, h2, h3, h4, .text-title, .feature-item__title, .hero-title');
            headings.forEach(function(h) { h.style.color = ts.headingColor; });
        }
        // 正文颜色
        if (ts.color) {
            var texts = el.querySelectorAll('p, span, .text-body, .text-body-large, .hero-subtitle, .feature-item__desc');
            texts.forEach(function(t) { t.style.color = ts.color; });
        }
        // 字体大小（含标题）
        if (ts.size) {
            var allText = el.querySelectorAll('h1, h2, h3, h4, p, span, li, .text-body, .text-title, .feature-item__title, .hero-title');
            allText.forEach(function(t) { t.style.fontSize = ts.size; });
        }
        // 文字对齐
        if (ts.align && ts.align !== 'left') {
            var containers = el.querySelectorAll('.container, .feature-grid, .hero-content, section');
            containers.forEach(function(c) { c.style.textAlign = ts.align; });
        }
        // 字重（含标题）
        if (ts.weight) {
            var allText = el.querySelectorAll('h1, h2, h3, h4, p, span, li, .text-title, .feature-item__title, .hero-title');
            allText.forEach(function(t) { t.style.fontWeight = ts.weight; });
        }
        // 字体族（含所有元素）
        if (ts.fontFamily) {
            var allText = el.querySelectorAll('*');
            allText.forEach(function(t) { t.style.fontFamily = ts.fontFamily; });
        }
        // 行高（含标题）
        if (ts.lineHeight) {
            var allText = el.querySelectorAll('h1, h2, h3, h4, p, span, li, .text-title, .feature-item__title, .hero-title');
            allText.forEach(function(t) { t.style.lineHeight = ts.lineHeight; });
        }
        // 字间距（含标题）
        if (ts.letterSpacing) {
            var allText = el.querySelectorAll('h1, h2, h3, h4, p, span, li, .text-title, .feature-item__title, .hero-title');
            allText.forEach(function(t) { t.style.letterSpacing = ts.letterSpacing; });
        }
    }

    /**
     * section_key → DOM 元素映射
     */
    function getSectionElement(key) {
        var map = {
            'body':       document.body,
            'header':     document.querySelector('.header'),
            'hero':       document.querySelector('.hero') || document.querySelector('.hero-bg'),
            'banner':     document.querySelector('.banner-carousel') && document.querySelector('.banner-carousel').closest('.section'),
            'products':   document.getElementById('products-section'),
            'features':   document.querySelector('[data-section="features"]'),
            'categories': document.getElementById('category-showcase') && document.getElementById('category-showcase').closest('.section--gray, .section'),
            'cta':        document.querySelector('.cta-section'),
            'footer':     document.querySelector('.footer')
        };
        return map[key] || null;
    }

    /**
     * 根据配置生成 CSS 字符串
     */
    function buildBackgroundCSS(config) {
        var css = '';

        switch (config.bg_type) {
            case 'none':
                return 'background:none;background-image:none;';

            case 'color':
                css = 'background:' + (config.bg_color || '#ffffff') + ';';
                css += 'background-image:none;';
                return css;

            case 'image':
                if (!config.bg_image) return '';
                css = 'background-image:url(' + config.bg_image + ');';
                css += 'background-size:' + (config.bg_size || 'cover') + ';';
                css += 'background-position:' + (config.bg_position || 'center center') + ';';
                css += 'background-repeat:' + (config.bg_repeat || 'no-repeat') + ';';
                if (config.bg_fixed) css += 'background-attachment:fixed;';
                return css;

            case 'gradient':
                var colors;
                try {
                    colors = typeof config.gradient_colors === 'string'
                        ? JSON.parse(config.gradient_colors)
                        : config.gradient_colors;
                } catch (e) {
                    colors = ['#1B2E5A', '#3A7BC8'];
                }
                var colorStr = colors.join(', ');

                if (config.gradient_type === 'radial') {
                    var shape = config.gradient_shape || 'circle';
                    var pos = config.gradient_position || 'center';
                    css = 'background-image:radial-gradient(' + shape + ' at ' + pos + ', ' + colorStr + ');';
                } else {
                    var angle = config.gradient_angle || 135;
                    css = 'background-image:linear-gradient(' + angle + 'deg, ' + colorStr + ');';
                }
                css += 'background-size:auto;';
                return css;
        }

        return '';
    }

    /**
     * 创建/更新叠加层 div（替代 ::after 无法动态设置的限制）
     */
    function applyOverlay(el, color, opacity) {
        var overlay = el.querySelector('.bg-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'bg-overlay';
            overlay.style.cssText =
                'position:absolute;inset:0;pointer-events:none;z-index:0;';
            var elPos = getComputedStyle(el).position;
            if (elPos === 'static') {
                el.style.position = 'relative';
            }
            el.insertBefore(overlay, el.firstChild);
        }
        overlay.style.backgroundColor = color;
        overlay.style.opacity = String(opacity);
    }

    // ==================== 自动初始化 ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applySectionBackgrounds);
    } else {
        applySectionBackgrounds();
    }
})();
