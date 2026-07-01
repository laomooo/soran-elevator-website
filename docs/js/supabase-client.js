// Supabase Client Configuration
const SUPABASE_URL = 'https://giayyvthjqzmqwczvckd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TUAc4mKeD3_wizZXv6Yk9A_svFxJXBz';

// 使用 CDN 加载的 supabase 全局变量创建客户端实例
var _sbModule = window.supabase;
if (!_sbModule || typeof _sbModule.createClient !== 'function') {
    console.error('[SORAN] Supabase SDK 加载失败，请刷新页面重试');
    // 提供一个空实现防止后续脚本崩溃
    window.supabase = { from: function(){ return this; }, select: function(){ return this; }, eq: function(){ return this; }, single: function(){ return Promise.resolve({data:null,error:new Error("SDK未加载")}); }, auth: { getSession: function(){ return Promise.resolve({data:{session:null},error:null}); }, signInWithPassword: function(){ return Promise.resolve({data:{},error:new Error("SDK未加载")}); }, signOut: function(){ return Promise.resolve({error:null}); } }, rpc: function(){ return Promise.resolve({data:null,error:null}); } };
} else {
    window.supabase = _sbModule.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
