// next.config.js
// 静态导出配置，用于 GitHub Pages 部署
// 若部署到 https://<user>.github.io/<repo>，需设置 NEXT_PUBLIC_BASE_PATH=/<repo>
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
