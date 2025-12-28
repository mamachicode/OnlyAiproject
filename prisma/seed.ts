import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("test123", 10);

  await prisma.user.upsert({
    where: { email: "creator@onlyai.com" },
    update: {},
    create: {
      email: "creator@onlyai.com",
      password: hashed,
      username: "creator",
      sfwPrice: 5,      // correct
      nsfwPrice: 10,    // correct
      isNsfw: true       // correct
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
