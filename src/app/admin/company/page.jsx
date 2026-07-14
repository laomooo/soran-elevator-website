'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const groups = [
  { key: 'basic', label: '基本信息' },
  { key: 'contact', label: '联系方式' },
  { key: 'social', label: '社交' },
];

export default function AdminCompany() {
  const [info, setInfo] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    const [{ data: ci }, { data: ss }] = await Promise.all([
      supabase.from('company_info').select('*').order('group_name'),
      supabase.from('site_settings').select('*'),
    ]);
    setInfo(ci || []);
    setSettings(ss || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateInfo = (id, value) => setInfo(info.map((i) => (i.id === id ? { ...i, value } : i)));
  const updateSetting = (id, value) => setSettings(settings.map((s) => (s.id === id ? { ...s, value } : s)));

  const saveAll = async () => {
    setMsg('保存中...');
    for (const i of info) {
      await supabase.from('company_info').update({ value: i.value }).eq('id', i.id);
    }
    for (const s of settings) {
      await supabase.from('site_settings').update({ value: s.value }).eq('id', s.id);
    }
    setMsg('全部保存成功');
    setTimeout(() => setMsg(''), 2000);
  };

  if (loading) return <p className="text-ink-500">加载中...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">公司信息与站点设置</h1>
        <button onClick={saveAll} className="btn-primary">保存全部</button>
      </div>
      {msg && <p className="mb-4 text-sm text-green-600">{msg}</p>}

      <div className="space-y-8">
        {groups.map((g) => {
          const fields = info.filter((i) => i.group_name === g.key);
          if (fields.length === 0) return null;
          return (
            <div key={g.key} className="card p-6">
              <h2 className="font-semibold mb-4">{g.label}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f.id}>
                    <label className="block text-sm font-medium mb-1">{f.key}</label>
                    <input
                      value={f.value}
                      onChange={(e) => updateInfo(f.id, e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none focus:border-brand-primary"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="card p-6">
          <h2 className="font-semibold mb-4">站点设置（首屏文案等）</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {settings.map((s) => (
              <div key={s.id}>
                <label className="block text-sm font-medium mb-1">{s.key}</label>
                <input
                  value={s.value}
                  onChange={(e) => updateSetting(s.id, e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none focus:border-brand-primary"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-ink-500">提示：修改并保存后，前台展示的内容会更新；如需静态页面立即生效，需在 GitHub 重新触发部署构建。</p>
    </div>
  );
}
