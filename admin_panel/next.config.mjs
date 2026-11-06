/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  optimizeFonts: false,
};

export default nextConfig;
