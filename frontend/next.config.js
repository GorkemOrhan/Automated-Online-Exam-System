/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for development
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000/api',
  },
  // Production-specific settings
  ...(process.env.NODE_ENV === 'production' && {
    basePath: "/Automated-Online-Exam-System",
    output: "export",
    publicRuntimeConfig: {
      basePath: "/Automated-Online-Exam-System",
    },
  }),
  // Development-specific settings
  ...(process.env.NODE_ENV === 'development' && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5000/api/:path*',
        },
      ];
    },
  }),
};

module.exports = nextConfig; 