import { Loader2 } from "lucide-react";

/** Route-level loading fallback shown during server component transitions. */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
