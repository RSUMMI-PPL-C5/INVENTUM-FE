"use client";

import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { useEffect, ReactNode } from "react";

// This is the component that gets used by Next.js error.tsx files
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
      <p className="mb-4 max-w-md text-gray-600">
        An error occurred and has been logged. Our team has been notified and we'll work on fixing it.
      </p>
      <Button onClick={reset} variant="destructive">
        Try again
      </Button>
    </div>
  );
}

// Create a wrapper component that can be used in layouts
export function ErrorBoundaryWrapper({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: React.ReactElement;
}) {
  return (
    <Sentry.ErrorBoundary fallback={fallback}>
      {children}
    </Sentry.ErrorBoundary>
  );
}
