/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      '*.public.blob.vercel-storage.com', // 允许所有子域名
      'picsum.photos' // 添加 picsum.photos 用于测试图片
    ]
  },
  webpack(config) {
    // 添加 Webpack 解析配置
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
      module: false,
    };
    return config;
  }
};

export default nextConfig;
