import { PrismaClient } from '@prisma/client';
import { data } from 'autoprefixer';

const prisma = new PrismaClient();

async function populatePlayers() {
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

async function populateGames() {
  const game = await prisma.game.create({
    data: {
      rotatyBlue: 'Always',
      rotatyRed: 'Always'
    }
  });

  const point = await prisma.point.create({
    data: {
      gameId: game.id
    }
  });

  await prisma.game.update({
    where: {
      id: game.id
    },
    data: {
      currentPointId: point.id
    }
  });
}

async function main() {
  await Promise.all([populateGames(), populatePlayers()]);
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
