import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const servesHttps = (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");

const contentSecurityPolicy = [
  ["default-src", "'self'"],
  ["script-src", "'self'", "'unsafe-inline'", ...(isProduction ? [] : ["'unsafe-eval'"])],
  ["style-src", "'self'", "'unsafe-inline'"],
  ["img-src", "'self'", "data:", "blob:"],
  ["font-src", "'self'"],
  ["connect-src", "'self'", ...(isProduction ? [] : ["ws:"])],
  ["media-src", "'self'"],
  ["frame-src", "https://www.aparat.com"],
  ["worker-src", "'self'", "blob:"],
  ["manifest-src", "'self'"],
  ["object-src", "'none'"],
  ["base-uri", "'self'"],
  ["form-action", "'self'"],
  ["frame-ancestors", "'none'"],
  ...(isProduction && servesHttps ? [["upgrade-insecure-requests"]] : []),
]
  .map((directive) => directive.join(" "))
  .join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  cacheHandler: isProduction ? require.resolve("./src/server/cache-handler.mjs") : undefined,
  reactStrictMode: true,
  reactCompiler: true,
  typedRoutes: true,
  poweredByHeader: false,
  agentRules: false,
  allowedDevOrigins: [
    "noncommunistic-stepfatherly-jeanice.ngrok-free.dev",
    "*.ngrok-free.dev",
    "*.ngrok-free.app",
    "*.ngrok.app",
    "*.ngrok.io",
  ],
  serverExternalPackages: ["@resvg/resvg-js"],
  outputFileTracingIncludes: {
    "/og/**": [
      "./src/assets/fonts/vazirmatn/static/*.ttf",
      "./src/assets/fonts/kufam/static/*.ttf",
    ],
  },
  outputFileTracingExcludes: {
    "*": [
      "./uploads/**",
      "./public/**",
      "./docs/**",
      "./deploy/**",
      "./drizzle/**",
      "./.github/**",
      "./*.md",
      "./src/**/*.{ts,tsx,css}",
      "./scripts/**",
      "./*.config.{ts,mjs}",
      "./tsconfig.json",
      "./*.tsbuildinfo",
      "./pnpm-lock.yaml",
      "./pnpm-workspace.yaml",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [{ pathname: "/uploads/**" }],
    remotePatterns: [],
    minimumCacheTTL: 2_592_000,
  },
  experimental: {
    globalNotFound: true,
    optimizePackageImports: ["lucide-react", "motion"],
  },
  headers() {
    return Promise.resolve([
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/((?!uploads/).*)",
        headers: [{ key: "Content-Security-Policy", value: contentSecurityPolicy }],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ]);
  },
};

export default nextConfig;
