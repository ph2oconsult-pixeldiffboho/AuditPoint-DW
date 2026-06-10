/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure the system-prompt markdown is bundled with the audit route on Vercel.
  outputFileTracingIncludes: {
    "/api/audit": ["./lib/auditpoint-dw.prompt.md"],
  },
};

module.exports = nextConfig;
