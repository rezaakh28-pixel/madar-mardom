import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// ---------------------------------------------------------------------------
// Bootstraps the single initial ADMIN account from environment variables.
// This is the ONLY way an admin account gets created — there is no
// admin registration page, by design (see src/app/register/, which only
// creates REPORTER accounts pending approval).
//
// Run once after connecting a database:
//   npx prisma db push
//   npx prisma db seed
//
// Safe to re-run: if ADMIN_USERNAME already exists, it just updates the
// password/name to match the current environment variables instead of
// creating a duplicate.
// ---------------------------------------------------------------------------

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "مدیر سایت";
  const email = process.env.ADMIN_EMAIL ?? `${username}@madaremardom.local`;

  if (!username || !password) {
    console.error(
      "خطا: ADMIN_USERNAME و ADMIN_PASSWORD باید در متغیرهای محیطی تنظیم شده باشند تا حساب مدیر ساخته شود."
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("خطا: ADMIN_PASSWORD باید حداقل ۸ نویسه باشد.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await db.user.upsert({
    where: { username },
    update: { passwordHash, name, role: "ADMIN", approvalStatus: "APPROVED", isActive: true },
    create: {
      username,
      email,
      name,
      passwordHash,
      role: "ADMIN",
      approvalStatus: "APPROVED",
      isActive: true,
    },
  });

  console.log(`حساب مدیر آماده است: ${admin.username}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
