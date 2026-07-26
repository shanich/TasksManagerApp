import { PrismaClient } from "../app/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertUser(name: string, email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { name, email, passwordHash },
  });
}

async function main() {
  const shaniEmail = process.env.SHANI_EMAIL ?? "shani.chuch@gmail.com";
  const shaniPassword = process.env.SHANI_PASSWORD ?? "changeme";
  const yoniEmail = process.env.YONI_EMAIL ?? "yoni@example.com";
  const yoniPassword = process.env.YONI_PASSWORD ?? "changeme";

  const shani = await upsertUser("Shani", shaniEmail, shaniPassword);
  const yoni = await upsertUser("Yoni", yoniEmail, yoniPassword);

  console.log("Seeded users:", { shani: shani.email, yoni: yoni.email });
  console.log(
    "Passwords come from SHANI_PASSWORD / YONI_PASSWORD env vars (default 'changeme' if unset) — set real ones in .env before deploying."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
