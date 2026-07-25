import { PrismaClient } from "@prisma/client";

// Prevent creating a new PrismaClient on every hot-reload in dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });
}

/**
 * Before a Postgres database is connected (DATABASE_URL unset — see README
 * "Authentication" section), constructing PrismaClient can throw immediately. Falling back to a Proxy
 * that only throws when an actual query is attempted means every call site
 * (login/register/admin actions) can catch that error with a normal
 * try/catch around `db.user.findUnique(...)` etc., instead of the whole
 * page crashing at import time.
 */
function createUnconfiguredClientStub(): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get() {
      throw new Error("پایگاه‌داده وصل نشده است. DATABASE_URL را در متغیرهای محیطی تنظیم کنید.");
    },
  });
}

export const db: PrismaClient =
  globalForPrisma.prisma ??
  (() => {
    try {
      return createClient();
    } catch {
      return createUnconfiguredClientStub();
    }
  })();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
