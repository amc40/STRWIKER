'use-client';

import { Button } from '@tremor/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { any } from 'prop-types';
import { Game } from '@prisma/client';

export default function HomeRouter(props: { currentGame: Game }) {
  const { currentGame } = props;

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div style={{ display: 'flex', height: '100vh' }}>
        {currentGame ? (
          <div>{currentGame.id}</div>
        ) : (
          <Button>Start Game</Button>
        )}
      </div>
    </main>
  );
}
