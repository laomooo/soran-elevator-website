// Supabase Client Configuration
const SUPABASE_URL = 'https://giayyvthjqzmqwczvckd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TUAc4mKeD3_wizZXv6Yk9A_svFxJXBz';

// ⚠️ 不能使用 const/let/var 重新声明 supabase（CDN 已通过 var supabase 定义了全局变量）
// 使用 Object.assign 替换 CDN 模块对象为客户端实例
var _sbModule = window.supabase;
window.supabase = _sbModule.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
