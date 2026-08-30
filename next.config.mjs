/** @type {import('next').NextConfig} */
const nextConfig = {
  // 全站静态导出：构建期生成所有路由，运行时无任何数据请求。
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  // 允许用 NEXT_DIST_DIR 指定构建中间目录，便于并行构建或清理后重建
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
