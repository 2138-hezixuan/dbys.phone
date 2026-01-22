/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/dbys.phone',  # 这行最重要！必须和仓库名一致
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
