/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removing the basePath setting to fix routing
  // basePath: "/Automated-Online-Exam-System",
  output: "export",
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000/api',
  },
  // Note: rewrites won't work with static exports, but we'll keep this for development
  async rewrites() {
    // Only apply in development
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.API_URL || 'http://localhost:5000/api'}/:path*`,
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig; 