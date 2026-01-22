/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用“静态导出”模式，这是GitHub Pages必需的
  output: 'export',
  // 设置基础路径，格式为：/你的仓库名。请确保这里填的就是 /dbys
  basePath: '/dbys',
  // 可选：防止静态导出时图片优化出错
  images: {
    unoptimized: true,
  },
  // 可选：确保链接路径一致性
  trailingSlash: true,
};

module.exports = nextConfig;