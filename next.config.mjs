/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [
        'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        '*.public.blob.vercel-storage.com' // 允许所有子域名
      ]
    }
  };
  
  export default nextConfig;
