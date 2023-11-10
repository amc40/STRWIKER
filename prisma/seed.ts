import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  [
    'Alan',
    'Ted',
    'Joey',
    'Emma',
    'Freya',
    'Jordan',
    'John',
    'Mike',
    'Henry'
  ].map(
    async (name) =>
      await prisma.player.create({
        data: {
          name
        }
      })
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
