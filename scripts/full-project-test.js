const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const projectRoot = path.join(__dirname, '..');
const envPath = path.join(projectRoot, '.env.local');
const outDir = path.join(projectRoot, 'out');

function loadEnv() {
  const env = {};
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
      const idx = line.indexOf('=');
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        env[key] = value;
      }
    });
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

const results = {
  env: { url: !!url, key: !!key, hasServiceRole: false },
  build: { exists: fs.existsSync(outDir) },
  pages: {},
  database: {},
  security: {},
  gitignore: {},
  files: {},
};

function checkFileContains(filePath, keywords) {
  if (!fs.existsSync(filePath)) return { exists: false };
  const content = fs.readFileSync(filePath, 'utf8');
  const found = {};
  keywords.forEach((kw) => (found[kw] = content.includes(kw)));
  return { exists: true, found, length: content.length };
}

async function runTests() {
  // 1. 检查 service_role key 是否意外出现在代码中
  const sourceFiles = [
    'src/lib/supabase.js',
    'src/lib/data.js',
    'src/lib/client-data.js',
    'next.config.js',
  ];
  results.security.serviceRoleLeaked = false;
  sourceFiles.forEach((f) => {
    const p = path.join(projectRoot, f);
    if (fs.existsSync(p)) {
      const c = fs.readFileSync(p, 'utf8');
      if (c.includes('service_role') || c.includes('SERVICE_ROLE')) {
        results.security.serviceRoleLeaked = true;
        results.security.leakFile = f;
      }
    }
  });

  // 2. 检查 .gitignore 是否排除 .env.local
  const gitignorePath = path.join(projectRoot, '.gitignore');
  const gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
  results.gitignore.envLocal = gitignore.includes('.env.local');
  results.gitignore.nodeModules = gitignore.includes('node_modules');
  results.gitignore.out = gitignore.includes('out') || gitignore.includes('/out');

  // 3. 检查关键静态页面 HTML
  const pagesToCheck = [
    { file: 'index.html', keywords: ['科技绿色', '产品中心', '新闻动态'] },
    { file: 'about/index.html', keywords: ['关于索然', '主营业务', '公司简介'] },
    { file: 'products/index.html', keywords: ['产品中心', '电梯光幕'] },
    { file: 'news/index.html', keywords: ['新闻动态', '公司新闻'] },
    { file: 'contact/index.html', keywords: ['联系我们', '在线留言'] },
  ];
  pagesToCheck.forEach((p) => {
    const filePath = path.join(outDir, p.file);
    results.pages[p.file] = checkFileContains(filePath, p.keywords);
  });

  // 4. 检查是否有未使用文件
  const unusedCandidates = [
    'src/components/ProductDetailContent.jsx',
  ];
  results.files.unused = {};
  unusedCandidates.forEach((f) => {
    results.files.unused[f] = fs.existsSync(path.join(projectRoot, f));
  });

  // 5. 数据库连接与表检查
  if (!url || !key) {
    results.database.error = 'Missing Supabase env vars';
    printResults();
    return;
  }

  const tables = ['product_categories', 'products', 'solutions', 'cases', 'news', 'inquiries', 'company_info', 'site_settings', 'business_services'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    results.database[table] = { ok: !error, error: error ? error.message : null, count: data ? data.length : null };
  }

  // 6. 匿名写入测试（应该失败）
  const { error: writeError } = await supabase.from('business_services').insert([{ title: 'test-anon', description: 'should fail' }]);
  results.security.anonWriteBlocked = !!writeError;
  results.security.anonWriteError = writeError ? writeError.message : null;

  // 7. Storage bucket 检查
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  results.storage = {
    ok: !bucketError,
    error: bucketError ? bucketError.message : null,
    buckets: buckets ? buckets.map((b) => b.name) : [],
  };

  printResults();
}

function printResults() {
  console.log('===== 全项目测试结果 =====\n');
  console.log('环境变量:');
  console.log('  URL configured:', results.env.url);
  console.log('  Key configured:', results.env.key);
  console.log('\n构建产物:');
  console.log('  out/ exists:', results.build.exists);
  console.log('\n静态页面检查:');
  Object.entries(results.pages).forEach(([file, r]) => {
    console.log('  ' + file + ': exists=' + r.exists + ', length=' + (r.length || 0));
    if (r.found) {
      Object.entries(r.found).forEach(([kw, found]) => console.log('    contains "' + kw + '": ' + found));
    }
  });
  console.log('\n数据库表检查:');
  Object.entries(results.database).forEach(([table, r]) => {
    if (typeof r === 'object' && r.ok !== undefined) {
      console.log('  ' + table + ': ok=' + r.ok + (r.error ? ', error=' + r.error : ''));
    } else {
      console.log('  ' + table + ':', r);
    }
  });
  console.log('\n安全检查:');
  console.log('  service_role leaked:', results.security.serviceRoleLeaked);
  console.log('  anonymous write blocked:', results.security.anonWriteBlocked);
  console.log('\nStorage 检查:');
  console.log('  ok:', results.storage.ok);
  console.log('  buckets:', results.storage.buckets.join(', '));
  console.log('\nGitignore 检查:');
  console.log('  .env.local ignored:', results.gitignore.envLocal);
  console.log('  node_modules ignored:', results.gitignore.nodeModules);
  console.log('  out ignored:', results.gitignore.out);
  console.log('\n文件检查:');
  Object.entries(results.files.unused).forEach(([f, exists]) => {
    console.log('  ' + f + ' exists:', exists, exists ? '(可能未使用)' : '');
  });

  const allOk = results.env.url && results.env.key && results.build.exists && results.security.anonWriteBlocked && !results.security.serviceRoleLeaked && results.gitignore.envLocal;
  console.log('\n===== 总体结论: ' + (allOk ? '通过' : '未通过') + ' =====');
}

runTests().catch((e) => {
  console.error('测试脚本异常:', e.message);
  process.exit(1);
});
