/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // react-leaflet ships as ESM; transpile so Next bundles it cleanly.
  transpilePackages: ['react-leaflet', '@react-leaflet/core'],
};

export default nextConfig;
