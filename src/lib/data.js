// 数据获取层：优先从 Supabase 读取，失败时返回兜底静态数据
// 确保未配置 Supabase 时前台仍可正常展示
import { supabase, isSupabaseConfigured } from './supabase';

// ===================== 兜底数据 =====================
export const fallbackCompanyInfo = {
  full_name: '广州索然电梯配件有限公司',
  full_name_en: 'GUANGZHOU SORAN ELEVATOR PARTS CO., LTD.',
  founded_year: '2011',
  slogan: '科技绿色，服务生活',
  address: '中国广东省广州市白云区嘉禾街新科科甲联兴路 6 号',
  hotline: '020-84040443',
  mobile: '18899735905',
  contact_person: '罗斯琪',
  qq: '3311803064',
  email: 'guangzhousoran@163.com',
  work_hours: '周一至周五 9:00 - 18:00',
  service_count: '300万+次',
};

export const fallbackSettings = {
  hero_title: '科技绿色 · 服务生活',
  hero_subtitle: '一站式电梯配件供应与技术服务专家',
  stat_founded: '2011 年成立',
  stat_service: '300 万+ 次服务交付',
  stat_brands: '覆盖主流电梯品牌配件',
  stat_factory: '自有研发与生产基地',
  cta_title: '需要电梯配件或升级改造方案？',
  footer_copyright: '广州索然电梯配件有限公司',
};

export const fallbackCategories = [
  { slug: 'elevator-light-curtain', name_cn: '电梯光幕', short_desc: '红外感应，98% 通用型电梯适配', icon: 'shield', image_url: '' },
  { slug: 'elevator-air-conditioner', name_cn: '电梯空调', short_desc: '单冷/冷暖可选，专业安装', icon: 'wind', image_url: '' },
  { slug: 'elevator-fan', name_cn: '电梯风扇', short_desc: '圆形/方形，低噪稳定', icon: 'fan', image_url: '' },
  { slug: 'elevator-wire-rope', name_cn: '电梯钢丝绳', short_desc: '高破断拉力，柔韧耐磨', icon: 'link', image_url: '' },
  { slug: 'elevator-steel-belt', name_cn: '电梯专用钢带', short_desc: '高强度镀锌芯，TPU 包覆', icon: 'box', image_url: '' },
  { slug: 'elevator-compensation-chain', name_cn: '电梯补偿链', short_desc: '阻燃耐老化，运行平稳', icon: 'git-merge', image_url: '' },
  { slug: 'escalator-handrail', name_cn: '扶梯扶手带', short_desc: '多层复合，耐磨抗撕裂', icon: 'circle', image_url: '' },
  { slug: 'elevator-electrical', name_cn: '电梯电气大配套', short_desc: '符合 GB7588.1，免调试交付', icon: 'cpu', image_url: '' },
];

export const fallbackProducts = [
  {
    slug: 'g1a1-609ab', name_cn: '电梯光幕 G1A1-609AB', model: 'G1A1-609AB', category_slug: 'elevator-light-curtain',
    one_line_selling: '98% 通用型电梯适配，响应快，抗光干扰',
    description: '索然电梯光幕采用红外线扫描感应技术，用于电梯门区安全防护，防止夹人夹物。',
    specs: [{ label: '型号', value: 'G1A1-609AB' }, { label: '适配梯型', value: '98% 通用型电梯' }, { label: '防护等级', value: 'IP54' }, { label: '响应时间', value: '≤ 80ms' }],
    applicable_scenes: '乘客电梯、载货电梯、医用电梯', advantages: '响应快速、抗光干扰、防护等级 IP54、安装便捷', is_featured: true,
  },
  {
    slug: 'sr-t03', name_cn: '电梯空调 SR-T03（冷暖 1P）', model: 'SR-T03', category_slug: 'elevator-air-conditioner',
    one_line_selling: '冷暖双模式，适配 300-1350KG 轿厢，低噪舒适',
    description: '索然自主研发电梯空调，专为电梯轿厢设计，制冷制热一体，节能静音。',
    specs: [{ label: '型号', value: 'SR-T03' }, { label: '类型', value: '冷暖 1P' }, { label: '适配轿厢', value: '300-1350KG' }, { label: '噪音', value: '≤ 45 dB(A)' }],
    applicable_scenes: '乘客电梯、观光电梯、医用电梯', advantages: '冷暖可选、节能静音、专业安装、售后完善', is_featured: true,
  },
  {
    slug: '8x19s-iwrc', name_cn: '电梯钢丝绳 8×19S+IWRC', model: '8×19S+IWRC', category_slug: 'elevator-wire-rope',
    one_line_selling: '高破断拉力，柔韧耐磨，乘客梯安全系数 ≥ 12',
    description: '钢芯结构电梯钢丝绳，适用于各类曳引式电梯，破断拉力高，使用寿命长。',
    specs: [{ label: '结构', value: '8×19S+IWRC（钢芯）' }, { label: '安全系数', value: '≥ 12（乘客梯）' }],
    applicable_scenes: '乘客电梯、载货电梯', advantages: '高破断拉力、柔韧、耐磨、低旋转', is_featured: false,
  },
  {
    slug: 'electrical-system', name_cn: '电梯电气大配套', model: '成套', category_slug: 'elevator-electrical',
    one_line_selling: '符合 GB7588.1 标准，布线简约，免调试交付',
    description: '索然电梯电气大配套涵盖控制柜、一体化控制器、人机界面、井道电气、门系统、线束线缆等。',
    specs: [{ label: '标准', value: 'GB7588.1' }, { label: '范围', value: '控制柜/人机界面/井道电气/门系统/线束' }],
    applicable_scenes: '新梯配套、旧梯改造', advantages: '标准领先、布线简约、电气安全、免调试交付', is_featured: true,
  },
];

export const fallbackNews = [
  { slug: 'soran-2024-service-milestone', title: '索然服务次数突破 300 万次', category: '公司新闻', summary: '截至当前，索然累计电梯配件服务交付次数突破 300 万次。', content: '广州索然电梯配件有限公司自 2011 年成立以来，始终专注于电梯配件供应与技术服务。截至目前，累计服务交付次数突破 300 万次，覆盖全国众多物业、维保与开发商客户。', published_at: '2024-06-01' },
  { slug: 'elevator-ac-selection-guide', title: '电梯空调选型指南：如何为轿厢选择合适的空调', category: '产品知识', summary: '从轿厢载重、使用场景到冷暖需求，一文看懂电梯空调选型。', content: '电梯空调选型需综合考虑轿厢载重、使用场景、冷暖需求与电源条件。300-1350KG 轿厢推荐 SR-T03（冷暖 1P），大型轿厢或观光梯推荐 SR-T06（冷暖 2P）。', published_at: '2024-05-15' },
  { slug: 'gb7588-1-standard-overview', title: 'GB7588.1 电梯制造标准要点解读', category: '行业资讯', summary: '解读 GB7588.1 对电梯电气安全的核心要求。', content: 'GB7588.1 是电梯制造与安装安全规范的核心标准，对电气安全、门系统、紧急操作等提出明确要求。索然电气大配套严格遵循该标准。', published_at: '2024-04-20' },
];

export const fallbackSolutions = [
  {
    slug: 'elevator-ac-installation', title: '一站式电梯空调安装服务',
    summary: '从现场勘测到交付验收的 6 步标准流程，专业团队全流程服务。',
    process_steps: [{ step: 1, title: '现场勘测', desc: '工程师上门勘测轿厢尺寸与安装条件' }, { step: 2, title: '机型选配', desc: '根据轿厢规格与需求选配空调机型' }, { step: 3, title: '运输配送', desc: '配送至现场并核对配件清单' }, { step: 4, title: '上门安装', desc: '专业安装团队规范施工' }, { step: 5, title: '电气接线及调试', desc: '接线、检漏、调试运行' }, { step: 6, title: '交付验收', desc: '客户验收并签署交付文件' }],
    advantages: ['快速响应', '现场勘测', '快速交付', '专业安装', '技术支持', '售后服务'],
    applicable_scenes: '高端住宅、写字楼、产业园、公共设施',
    content: '索然提供从选型到交付的一站式电梯空调安装服务，确保安装规范、运行稳定。',
  },
  {
    slug: 'elevator-upgrade', title: '电梯升级改造整体解决方案',
    summary: '涵盖控制柜、门系统、光幕、电气配套的旧梯改造整体方案。',
    components: ['控制柜', '应急救援装置', '门系统', '电梯光幕', '操纵盘 & 外呼盒', '底坑检修箱', '曳引机', '编码器', '钢丝绳 / 钢带', '轿顶一体箱', '感应器', '成套线缆'],
    advantages: ['标准领先', '布线简约', '电气安全', '免调试交付', '功能集成'],
    applicable_scenes: '旧梯改造、功能升级、安全合规改造',
    content: '索然电梯升级改造整体解决方案，帮助客户以最小代价提升电梯安全性与乘坐体验。',
  },
];

export const fallbackBusinessServices = [
  { title: '主流品牌零部件供应', description: '多家龙头电梯部件企业核心代理商，一站式满足采购需求', image_url: '', sort_order: 1, is_active: true },
  { title: '自主研发生产', description: '电梯空调、梯控系统等加装类产品，品质与交付可控', image_url: '', sort_order: 2, is_active: true },
  { title: '技术服务支持', description: '从选型到交付的全流程标准化服务与技术支持', image_url: '', sort_order: 3, is_active: true },
];

// ===================== 数据获取函数 =====================
export async function getCompanyInfo() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('company_info').select('key,value');
      if (!error && data) {
        const obj = {};
        data.forEach((r) => (obj[r.key] = r.value));
        return { ...fallbackCompanyInfo, ...obj };
      }
    } catch (e) {}
  }
  return fallbackCompanyInfo;
}

export async function getSettings() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('site_settings').select('key,value');
      if (!error && data) {
        const obj = {};
        data.forEach((r) => (obj[r.key] = r.value));
        return { ...fallbackSettings, ...obj };
      }
    } catch (e) {}
  }
  return fallbackSettings;
}

export async function getCategories() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('sort_order');
      if (!error && data && data.length) return data;
    } catch (e) {}
  }
  return fallbackCategories;
}

export async function getProducts(categorySlug) {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('products').select('*, product_categories(slug,name_cn)').order('sort_order');
      if (categorySlug) {
        const { data: cat } = await supabase.from('product_categories').select('id').eq('slug', categorySlug).single();
        if (cat) query = query.eq('category_id', cat.id);
      }
      const { data, error } = await query;
      if (!error && data && data.length) return data;
    } catch (e) {}
  }
  return categorySlug ? fallbackProducts.filter((p) => p.category_slug === categorySlug) : fallbackProducts;
}

export async function getProductBySlug(slug) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single();
      if (!error && data) return data;
    } catch (e) {}
  }
  return fallbackProducts.find((p) => p.slug === slug) || null;
}

export async function getFeaturedProducts() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('is_featured', true).order('sort_order');
      if (!error && data && data.length) return data;
    } catch (e) {}
  }
  return fallbackProducts.filter((p) => p.is_featured);
}

export async function getNews() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      if (!error && data && data.length) return data;
    } catch (e) {}
  }
  return fallbackNews;
}

export async function getNewsBySlug(slug) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('news').select('*').eq('slug', slug).single();
      if (!error && data) return data;
    } catch (e) {}
  }
  return fallbackNews.find((n) => n.slug === slug) || null;
}

export async function getSolutions() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('solutions').select('*').order('sort_order');
      if (!error && data && data.length) return data;
    } catch (e) {}
  }
  return fallbackSolutions;
}

export async function getBusinessServices() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('business_services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (!error && data && data.length) return data;
    } catch (e) {}
  }
  return fallbackBusinessServices;
}
