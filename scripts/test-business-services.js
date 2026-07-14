const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
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

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL configured:', !!url);
console.log('Key configured:', !!key);

if (!url || !key) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
  // 1. 查询主营业务表（匿名读）
  const { data: services, error: readError } = await supabase
    .from('business_services')
    .select('*')
    .order('sort_order', { ascending: true });

  if (readError) {
    console.error('READ ERROR:', readError.message);
    process.exit(1);
  }
  console.log('business_services count:', services.length);
  services.forEach((s, i) => {
    console.log('  ' + (i + 1) + '. ' + s.title + ' | image: ' + (s.image_url ? 'yes' : 'no'));
  });

  // 2. 测试匿名写权限（应该失败）
  const { error: writeError } = await supabase
    .from('business_services')
    .insert([{ title: 'test-anonymous', description: 'should fail' }]);
  console.log('Anonymous write blocked:', writeError ? 'YES' : 'NO');
  if (!writeError) {
    console.error('SECURITY: anonymous write should be blocked');
    process.exit(1);
  }

  // 3. 测试 Storage bucket 存在（匿名读）
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error('BUCKET LIST ERROR:', bucketError.message);
  } else {
    const names = buckets.map((b) => b.name);
    console.log('Buckets:', names.join(', '));
    console.log('company-assets bucket exists:', names.includes('company-assets'));
  }

  console.log('\nAll tests passed.');
}

test().catch((e) => {
  console.error('TEST FAILED:', e.message);
  process.exit(1);
});
