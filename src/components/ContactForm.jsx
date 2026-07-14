'use client';

import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const inquiryTypes = ['产品咨询', '方案定制', '技术支持', '售后服务', '其他'];

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    inquiry_type: '产品咨询',
    message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = '请输入姓名';
    if (!form.phone.trim()) e.phone = '请输入联系电话';
    else if (!/^[\d\-+ ]{7,20}$/.test(form.phone)) e.phone = '电话格式不正确';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = '邮箱格式不正确';
    if (!form.message.trim() || form.message.trim().length < 5) e.message = '请输入至少 5 字的需求描述';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!isSupabaseConfigured) {
      setStatus('success');
      setForm({ name: '', company: '', phone: '', email: '', inquiry_type: '产品咨询', message: '' });
      return;
    }

    setStatus('submitting');
    try {
      const { error } = await supabase.from('inquiries').insert({
        name: form.name.trim(),
        company: form.company.trim() || null,
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        inquiry_type: form.inquiry_type,
        message: form.message.trim(),
        status: 'pending',
      });
      if (error) throw error;
      setStatus('success');
      setForm({ name: '', company: '', phone: '', email: '', inquiry_type: '产品咨询', message: '' });
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-3xl mb-4">✓</div>
        <h3 className="text-xl font-semibold mb-2">提交成功！</h3>
        <p className="text-ink-500 mb-6">感谢您的留言，我们的客服将在 24 小时内与您联系。</p>
        <button onClick={() => setStatus('idle')} className="btn-outline">再次留言</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 lg:p-8 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">姓名 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            className="w-full h-12 px-4 rounded-lg border border-ink-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
            placeholder="请输入您的姓名"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">公司名称</label>
          <input
            type="text"
            value={form.company}
            onChange={handleChange('company')}
            className="w-full h-12 px-4 rounded-lg border border-ink-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
            placeholder="选填"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">联系电话 <span className="text-red-500">*</span></label>
          <input
            type="tel"
            inputMode="tel"
            value={form.phone}
            onChange={handleChange('phone')}
            className="w-full h-12 px-4 rounded-lg border border-ink-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
            placeholder="手机号或固话"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">邮箱</label>
          <input
            type="email"
            inputMode="email"
            value={form.email}
            onChange={handleChange('email')}
            className="w-full h-12 px-4 rounded-lg border border-ink-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
            placeholder="选填"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">咨询类型</label>
        <select
          value={form.inquiry_type}
          onChange={handleChange('inquiry_type')}
          className="w-full h-12 px-4 rounded-lg border border-ink-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none bg-white"
        >
          {inquiryTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">需求描述 <span className="text-red-500">*</span></label>
        <textarea
          value={form.message}
          onChange={handleChange('message')}
          rows={5}
          className="w-full px-4 py-3 rounded-lg border border-ink-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none resize-none"
          placeholder="请简要描述您的需求，如电梯型号、所需配件、项目规模等"
        />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
      </div>

      {status === 'error' && (
        <p className="text-red-500 text-sm">提交失败，请稍后重试或直接致电 020-84040443</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-primary w-full disabled:opacity-50"
      >
        {status === 'submitting' ? '提交中...' : '提交留言'}
      </button>
      <p className="text-xs text-ink-500 text-center">提交后客服将在 24 小时内响应</p>
    </form>
  );
}
