"use client";

/**
 * Interactive API documentation page (/api/docs).
 *
 * Renders Swagger UI against the OpenAPI document served from
 * /api/docs/spec. Because auth uses HTTP-only cookies, logging in through the
 * web UI first means "Try it out" requests here are automatically
 * authenticated — no manual token pasting.
 */
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b bg-slate-50 px-6 py-4">
        <h1 className="text-xl font-semibold text-slate-900">TaskFlow API Reference</h1>
        <p className="text-sm text-slate-600">
          Log in via the app first, then use “Try it out” — requests use your session cookie.
        </p>
      </div>
      <SwaggerUI url="/api/docs/spec" docExpansion="list" />
    </div>
  );
}
