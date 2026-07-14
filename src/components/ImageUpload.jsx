'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function ImageUpload({
  bucket = 'product-images',
  folder = '',
  value,
  onChange,
  multiple = false,
  maxSize = 5,
  accept = 'image/*',
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const values = multiple
    ? Array.isArray(value) ? value : []
    : value ? [value] : [];

  const getPublicUrl = (path) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || '';
  };

  const handleFile = async (file) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }
    if (file.size > maxSize * 1024 * 1024) {
      setError(`图片大小不能超过 ${maxSize}MB`);
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const name = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
      const path = folder ? `${folder}/${name}` : name;
      const { error: upError } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (upError) throw upError;
      const url = getPublicUrl(path);
      if (multiple) {
        onChange([...values, url]);
      } else {
        onChange(url);
      }
    } catch (e) {
      setError('上传失败：' + (e.message || e));
    } finally {
      setUploading(false);
    }
  };

  const handleChange = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      await handleFile(file);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = (idx) => {
    if (multiple) {
      const next = values.filter((_, i) => i !== idx);
      onChange(next);
    } else {
      onChange('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {values.map((url, i) => (
          <div key={`${url}-${i}`} className="relative w-24 h-24 rounded-lg border border-ink-200 overflow-hidden group bg-ink-50">
            <Image src={url} alt="preview" fill className="object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="删除图片"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 rounded-lg border-2 border-dashed border-ink-300 flex flex-col items-center justify-center text-ink-500 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <span className="text-xs">上传中...</span>
          ) : (
            <>
              <span className="text-2xl leading-none mb-1">+</span>
              <span className="text-xs">上传图片</span>
            </>
          )}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-ink-400">支持 JPG、PNG、WebP，单张不超过 {maxSize}MB</p>
    </div>
  );
}
