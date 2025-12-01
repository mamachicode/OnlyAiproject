import prisma from "../src/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  const hashed = await bcrypt.hash("test123", 10);

  await prisma.user.upsert({
    where: { email: "creator@onlyai.com" },
    update: {},
    create: {
      email: "creator@onlyai.com",
      password: hashed,
      username: "creator",
      subscriptionPrice: 5,
      isNsfw: true,   // This creator belongs to the NSFW section
    },
  });

  console.log("🌱 Seed complete: creator@onlyai.com with isNsfw = true");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit());
