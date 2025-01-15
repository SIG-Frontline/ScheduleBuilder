import type { NextConfig } from "next";
const isDocker =
  process.platform === "linux" && //if it quacks like a duck
  process.arch === "x64" && //and walks like a duck
  process.cwd() === "/app"; //then its a ducks
const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
  output: isDocker ? "standalone" : undefined,
};

export default nextConfig;
