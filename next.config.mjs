/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@airgap/beacon-ui"],
  },
  webpack: (config, {isServer }) => {
    config.externals.push('pino-pretty');
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          net: false,
          dns: false,
          tls: false,
          fs: false,
          request: false,
        },
      };
    }
    return config;
  },
};

export default nextConfig;
