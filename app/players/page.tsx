import React from 'react';
import { getPlayers } from '../../lib/Player.actions';
import { PlayersClient } from './PlayersClient';

interface PlayersProps {}

const Players: React.FC<PlayersProps> = async ({}) => {
  const players = await getPlayers();

  return <PlayersClient serverPlayers={players} />;
};

export default Players;
