import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: "https://721a10e256ebe62e04643e7838bb07cd@o4509239405838336.ingest.us.sentry.io/4509314604138496",
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  tracesSampleRate: 1.0,

  // Adjust this value in production to control how many transactions you want to track
  // For production, you might want to reduce it to around 0.1 (10%)
  replaysSessionSampleRate: 0.1,
  // If the entire session is not sampled, use the below sample rate to sample
  // error sessions only
  replaysOnErrorSampleRate: 1.0,
});
