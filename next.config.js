/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/dbys.phone',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
