'use client';

import { Player } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { addPlayer, getPlayers } from '../../lib/Player.actions';
import { useMessage } from '../context/MessageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PlayersClientProps {
  serverPlayers: Player[];
}

export const PlayersClient: React.FC<PlayersClientProps> = ({
  serverPlayers,
}) => {
  const [players, setPlayers] = useState<Player[]>(serverPlayers);

  const populatePlayers = async () => {
    const players = await getPlayers();
    setPlayers(players);
  };

  const { addErrorMessage } = useMessage();

  useEffect(() => {
    const interval = setInterval(() => {
      populatePlayers().catch((e: unknown) => {
        addErrorMessage('Error populating players', e);
      });
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [addErrorMessage]);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddPlayer = async () => {
    if (newPlayerName.trim() === '') return;
    if (
      players.some(
        (player) =>
          player.name.toLowerCase().trim() ===
          newPlayerName.toLowerCase().trim(),
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
    await populatePlayers();
    setNewPlayerName('');
  };

  const filteredPlayers = players.filter((player: Player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="bg-white p-3">
        <h1 className="text-3xl">Players</h1>

        <div className="flex items-center">
          <Input
            type="text"
            placeholder="Enter player name"
            value={newPlayerName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewPlayerName(e.target.value);
            }}
            className="my-4 mr-2"
          />
          <Button
            onClick={() => {
              handleAddPlayer().catch((e: unknown) => {
                addErrorMessage('Error adding new player', e);
              });
            }}
          >
            Add Player
          </Button>
        </div>

        <Input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value);
          }}
          className="mb-3"
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
