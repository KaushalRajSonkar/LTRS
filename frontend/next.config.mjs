/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ye build ke time ESLint errors ko ignore karega
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ye build ke time TypeScript errors ko ignore karega
    ignoreBuildErrors: true,
  },
};

export default nextConfig;