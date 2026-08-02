/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["playwright", "@axe-core/playwright"],
  experimental: {
    serverComponentsExternalPackages: ["playwright", "@axe-core/playwright"],
  },
};

export default nextConfig;
