import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["twitter-api-v2"],
  webpack: (config, { isServer }) => {
    // Add extensionAlias for .js
    config.resolve = config.resolve || {};
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };

      config.module.rules.push({
        test: /\.node$/,
        loader: "null-loader",
      });
    }

    return config;
  },
};

export default nextConfig;
