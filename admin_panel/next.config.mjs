/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  optimizeFonts: false,
};

export default nextConfig;
