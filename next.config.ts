import type { NextConfig } from "next";

const isStandaloneBuild = process.env.STANDALONE_BUILD === '1';

const nextConfig: NextConfig = {
  ...(isStandaloneBuild ? { output: 'standalone' as const } : {}),
};

export default nextConfig;
