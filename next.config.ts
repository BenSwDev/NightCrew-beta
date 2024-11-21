// next.config.ts
import type { NextConfig } from "next";
import withPWA from "next-pwa";
import runtimeCaching from "next-pwa/cache";

const customRuntimeCaching = [
  {
    urlPattern: /^\/icons\/.*\.(png|jpg|jpeg|svg|gif)$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "static-images",
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      },
    },
  },
  {
    urlPattern: /^\/splash\/.*\.(png|jpg|jpeg|svg|gif)$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "splash-images",
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      },
    },
  },
  ...runtimeCaching,
];

const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: customRuntimeCaching,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    //appDir: true,
  },
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
};

export default pwaConfig(nextConfig);
