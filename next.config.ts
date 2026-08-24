import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  allowedDevOrigins: ["localhost", "192.168.10.125"],
  serverExternalPackages: ["@opentelemetry/api"],
  experimental: {
    useTypeScriptCli: true,
    turbopackRustReactCompiler: true,
  },
};

export default nextConfig;
