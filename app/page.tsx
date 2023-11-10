'use client';
import { Button } from '@tremor/react';
import { redirect } from 'next/navigation';
import { CSSProperties, useEffect, useState } from 'react';
import { any } from 'prop-types';
import { Game, Player, PlayerPoint, Point } from '@prisma/client';
import { getCurrentGame as getCurrentGameAndPoint, startGame } from './helper';
import { PointComponent } from './components/point';

export default function Page() {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [currentPoint, setCurrentPoint] = useState<
    (Point & { playerPoints: (PlayerPoint & { player: Player })[] }) | null
  >(null);

  useEffect(() => {
    async function callGetCurrentGame() {
      const gameAndPoint = await getCurrentGameAndPoint();
      setCurrentGame(gameAndPoint.game);
      setCurrentPoint(gameAndPoint.point);
    }
    callGetCurrentGame();
  }, []);

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      {currentPoint ? (
        <PointComponent point={currentPoint} />
      ) : (
        <Button
          style={styles.startButton}
          onClick={() => {
            console.log('starting game..');
          }}
        >
          Start Game
        </Button>
      )}
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  startButton: {
    height: '100px'
  }
};
