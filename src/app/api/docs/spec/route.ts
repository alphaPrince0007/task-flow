/**
 * GET /api/docs/spec  → the raw OpenAPI JSON document.
 * Consumed by the Swagger UI page at /api/docs.
 */
import { NextResponse } from "next/server";
import { openApiSpec } from "@/lib/openapi";

export function GET() {
  return NextResponse.json(openApiSpec);
}
