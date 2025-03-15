/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/Automated-Online-Exam-System",
  output: "export",
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000/api',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://localhost:5000/api'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig; 