const { withSentryConfig } = require("@sentry/nextjs");

// Your existing Next.js config
const nextConfig = {
  // Your existing configuration
};

// Sentry configuration
const sentryConfig = {
  silent: true,
  org: "kevin-ignatius-wijaya",
  project: "javascript-nextjs",
  // Any other Sentry options
};

// Export the configuration with Sentry wrapped around it
module.exports = withSentryConfig(nextConfig, sentryConfig);
