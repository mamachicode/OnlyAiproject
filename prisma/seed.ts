// @ts-nocheck
import prisma from "../src/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  const hashed = await bcrypt.hash("test123", 10);

  await prisma.user.create({
    data: {
      email: "test@onlyai.com",
      password: hashed,
      username: "testuser",
      bio: "Seeded test user",
    },
  });

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
