/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // On Vercel, pages/api/[...path].js handles all /api/* routes natively.
    // Locally, proxy to the Express dev server.
    if (process.env.VERCEL) return [];
    const apiBase = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:5000";
    return [{ source: "/api/:path*", destination: `${apiBase}/api/:path*` }];
  },
};

export default nextConfig;
