'use client';

import { Player } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { addPlayer, getPlayers } from '../../lib/Player.actions';
import { PrimaryButton } from '../components/PrimaryButton';

interface PlayersClientProps {
  serverPlayers: Player[];
}

export const PlayersClient: React.FC<PlayersClientProps> = ({
  serverPlayers
}) => {
  const [players, setPlayers] = useState<Player[]>(serverPlayers);

  const populatePlayers = async () => {
    const players = await getPlayers();
    setPlayers(players);
  };

  useEffect(() => {
    const interval = setInterval(populatePlayers, 1000);
    populatePlayers();
    return () => clearInterval(interval);
  }, []);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddPlayer = async () => {
    if (newPlayerName.trim() === '') return;
    if (
      players.some(
        (player) =>
          player.name.toLowerCase().trim() ===
          newPlayerName.toLowerCase().trim()
      )
    ) {
      // TODO: display some kind of error
      setNewPlayerName('');
      return;
    }

    const formattedName =
      newPlayerName.charAt(0).toUpperCase() +
      newPlayerName.slice(1).toLowerCase().trim();

    // Maybe add a useOptimistic call here
    await addPlayer({ name: formattedName });
    populatePlayers();
    setNewPlayerName('');
  };

  const handleSearch = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const filteredPlayers = players.filter((player: any) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="bg-white p-3">
        <h1 className="text-3xl">Players</h1>

        <div>
          <input
            type="text"
            placeholder="Enter player name"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="my-4 mr-2 p-1.5 border border-black rounded"
          />
          <PrimaryButton text="Add Player" onClick={handleAddPlayer} />
        </div>

        <input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={handleSearch}
          className="mb-3 p-2"
        />

        <ul>
          {filteredPlayers.map((player, index) => (
            <li
              key={player.id}
              className={`mb-2 pb-2 border-b border-black ${
                index % 2 == 0 ? 'text-team-blue' : 'text-team-red'
              }`}
            >
              {player.name}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};
