/**
 * Browser API client.
 *
 * A thin typed wrapper over fetch that (a) always sends cookies (so the
 * HTTP-only auth cookie rides along), (b) unwraps our standard envelope, and
 * (c) throws a typed ApiClientError carrying the message and any field errors,
 * so components can show precise feedback.
 */
import type { ApiSuccess, ApiError } from "@/types";

export class ApiClientError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: "include", // send/receive HTTP-only cookies
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
  });

  const json = (await res.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiError
    | null;

  if (!res.ok || !json || json.success === false) {
    const err = json as ApiError | null;
    throw new ApiClientError(
      res.status,
      err?.message ?? "Request failed",
      err?.errors,
    );
  }

  return (json as ApiSuccess<T>).data;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
