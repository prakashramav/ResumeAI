/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://resumeai-6y80.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;