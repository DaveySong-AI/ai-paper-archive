/**
 * 部署到子路径（如 GitHub Pages 的项目站）时，必须设置 basePath，
 * 否则页面里 /_next/... 这类绝对路径会指向域名根而非仓库子目录，导致资源 404。
 *
 *   NEXT_BASE_PATH=/仓库名 npm run build
 *
 * 部署在域名根目录时留空即可。
 */
const basePath = process.env.NEXT_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 全站静态导出：构建期生成所有路由，运行时无任何数据请求。
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  basePath,
  // 允许用 NEXT_DIST_DIR 指定构建中间目录，便于并行构建或清理后重建
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
