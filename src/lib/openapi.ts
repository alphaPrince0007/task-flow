/**
 * OpenAPI 3.0 specification for the TaskFlow API.
 *
 * Kept as a typed object and served from /api/docs/spec, then rendered by the
 * Swagger UI page at /api/docs. Writing it by hand (rather than generating from
 * decorators) keeps the dependency surface small and the contract explicit.
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "TaskFlow API",
    version: "1.0.0",
    description:
      "Scalable Task Management REST API with JWT authentication and role-based access control (RBAC). Auth tokens are delivered as HTTP-only cookies; use the web UI to log in, then this page's requests will be authenticated automatically.",
  },
  servers: [{ url: "/api/v1", description: "API v1" }],
  tags: [
    { name: "Auth", description: "Registration, login, logout, profile" },
    { name: "Tasks", description: "Task CRUD (owner-scoped; admins see all)" },
    { name: "Admin", description: "User management (admin only)" },
  ],
  components: {
    schemas: {
      SuccessEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          data: { type: "object" },
        },
      },
      ErrorEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          errors: { type: "object", additionalProperties: { type: "array", items: { type: "string" } } },
        },
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "COMPLETED"] },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          dueDate: { type: "string", format: "date-time", nullable: true },
          userId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Jane Doe" },
                  email: { type: "string", example: "jane@example.com" },
                  password: { type: "string", example: "Passw0rd" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Account created", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessEnvelope" } } } },
          "409": { description: "Email already registered", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in and receive auth cookies",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "admin@taskflow.dev" },
                  password: { type: "string", example: "Admin@123" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Logged in", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessEnvelope" } } } },
          "401": { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
        },
      },
    },
    "/auth/logout": {
      post: { tags: ["Auth"], summary: "Log out (clears cookies)", responses: { "200": { description: "Logged out" } } },
    },
    "/auth/me": {
      get: { tags: ["Auth"], summary: "Get current profile", responses: { "200": { description: "Profile" }, "401": { description: "Unauthorized" } } },
      patch: {
        tags: ["Auth"],
        summary: "Update current profile",
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, email: { type: "string" } } } } },
        },
        responses: { "200": { description: "Updated" }, "401": { description: "Unauthorized" } },
      },
    },
    "/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks (paginated, filterable, sortable)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "IN_PROGRESS", "COMPLETED"] } },
          { name: "priority", in: "query", schema: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["createdAt", "dueDate", "priority", "title"] } },
          { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
        ],
        responses: { "200": { description: "Task list" }, "401": { description: "Unauthorized" } },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create a task",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string", example: "Write documentation" },
                  description: { type: "string", example: "Cover setup and API usage" },
                  status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "COMPLETED"] },
                  priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
                  dueDate: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Created" }, "400": { description: "Validation error" }, "401": { description: "Unauthorized" } },
      },
    },
    "/tasks/{id}": {
      get: { tags: ["Tasks"], summary: "Get a task", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Task" }, "404": { description: "Not found" } } },
      patch: {
        tags: ["Tasks"],
        summary: "Update a task",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/Task" } } } },
        responses: { "200": { description: "Updated" }, "404": { description: "Not found" } },
      },
      delete: { tags: ["Tasks"], summary: "Delete a task", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Deleted" }, "404": { description: "Not found" } } },
    },
    "/users": {
      get: { tags: ["Admin"], summary: "List all users (admin only)", responses: { "200": { description: "Users" }, "403": { description: "Forbidden" } } },
    },
    "/users/{id}": {
      delete: { tags: ["Admin"], summary: "Delete a user (admin only)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Deleted" }, "403": { description: "Forbidden" } } },
    },
    "/users/{id}/role": {
      patch: {
        tags: ["Admin"],
        summary: "Change a user's role (admin only)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["role"], properties: { role: { type: "string", enum: ["USER", "ADMIN"] } } } } } },
        responses: { "200": { description: "Updated" }, "403": { description: "Forbidden" } },
      },
    },
  },
} as const;
