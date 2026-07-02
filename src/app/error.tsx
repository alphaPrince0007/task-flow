"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Global error boundary for the App Router. Catches unexpected client render
 * errors, logs them, and offers a retry. Never shows a raw stack trace to users.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real app this would go to an error tracker (Sentry, etc.).
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-destructive">500</p>
      <h1 className="mt-4 text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        An unexpected error occurred. You can try again.
      </p>
      <Button className="mt-6" onClick={reset}>Try again</Button>
    </div>
  );
}
