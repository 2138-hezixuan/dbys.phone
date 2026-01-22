/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用"静态导出"模式，这是GitHub Pages必需的
  output: 'export',
  
  // 设置基础路径，格式为：/你的仓库名。请确保这里填的就是 /dbys
  basePath: '/dbys',
  
  // 可选：防止静态导出时图片优化出错
  images: {
    unoptimized: true,
  },
  
  // 可选：确保链接路径一致性
  trailingSlash: true,
  
  // 添加安全头，增强移动端安全性
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  },
  
  // 配置Webpack，确保所有资源正确处理
  webpack: (config, { isServer }) => {
    // 如果导出到静态文件，确保资源路径正确
    if (!isServer) {
      config.output.publicPath = `${nextConfig.basePath || ''}/_next/`;
    }
    return config;
  },
  
  // 优化移动端体验的配置
  experimental: {
    // 确保静态导出时的优化
    optimizeCss: true,
  },
  
  // 编译时环境变量（如果需要）
  env: {
    // 添加环境变量，如API端点等
    NEXT_PUBLIC_APP_NAME: '雕版印刷游戏',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
  
  // 添加重定向规则（如果需要）
  async redirects() {
    return [
      {
        source: '/',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // 禁用某些开发功能以减小包大小
  compiler: {
    // 移除开发环境中的console.log
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;