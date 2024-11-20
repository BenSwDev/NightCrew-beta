declare module "next-pwa" {
  import { NextConfig } from "next";
  import { Options } from "workbox-webpack-plugin";

  interface PWAConfig {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    runtimeCaching?: Options["runtimeCaching"];
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;

  export default withPWA;
}

declare module "next-pwa/cache" {
  import { RuntimeCaching } from "workbox-build";
  const runtimeCaching: RuntimeCaching[];
  export default runtimeCaching;
}
