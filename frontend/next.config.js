/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable basePath for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? "/Automated-Online-Exam-System" : "",
  output: "export",
  reactStrictMode: true,
  // Make basePath available to client-side code
  publicRuntimeConfig: {
    basePath: process.env.NODE_ENV === 'production' ? "/Automated-Online-Exam-System" : "",
  },
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