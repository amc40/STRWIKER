import React from 'react';
import { getPlayers } from '../../lib/Player.actions';
import { PlayersClient } from './PlayersAdminClient';

export const dynamic = 'force-dynamic';

const Players: React.FC = async () => {
  const players = await getPlayers();

  return <PlayersClient serverPlayers={players} />;
};

export default Players;
