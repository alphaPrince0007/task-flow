/**
 * Database seed.
 *
 * Creates two accounts (one admin, one regular user) and a handful of
 * sample tasks so the app is demonstrable the moment it starts. Uses
 * upsert so re-running the seed is safe and idempotent.
 *
 * Run with:  npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;

async function main() {
  console.log("🌱 Seeding database…");

  const adminPassword = await bcrypt.hash("Admin@123", BCRYPT_ROUNDS);
  const userPassword = await bcrypt.hash("User@123", BCRYPT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: "admin@taskflow.dev" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@taskflow.dev",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@taskflow.dev" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@taskflow.dev",
      passwordHash: userPassword,
      role: "USER",
    },
  });

  // Give the demo user some starter tasks (only if they have none yet).
  const existingTaskCount = await prisma.task.count({ where: { userId: user.id } });
  if (existingTaskCount === 0) {
    await prisma.task.createMany({
      data: [
        {
          title: "Set up development environment",
          description: "Install Node.js, clone the repo, and run the app locally.",
          status: "COMPLETED",
          priority: "HIGH",
          userId: user.id,
        },
        {
          title: "Read the API documentation",
          description: "Explore the Swagger docs at /api/docs.",
          status: "IN_PROGRESS",
          priority: "MEDIUM",
          userId: user.id,
        },
        {
          title: "Create your first task",
          description: "Try the create-task form on the dashboard.",
          status: "PENDING",
          priority: "LOW",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          userId: user.id,
        },
        {
          title: "Prepare demo for reviewer",
          description: "Walk through auth, RBAC, and CRUD end to end.",
          status: "PENDING",
          priority: "HIGH",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          userId: user.id,
        },
      ],
    });
  }

  console.log("✅ Seed complete.");
  console.log("   Admin →  admin@taskflow.dev / Admin@123");
  console.log("   User  →  user@taskflow.dev  / User@123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
