/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
