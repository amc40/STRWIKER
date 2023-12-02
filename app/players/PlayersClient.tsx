'use client';

import { Player } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { addPlayer, getPlayers } from '../../lib/Player.actions';

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
      <div style={{ backgroundColor: '#fff', padding: '20px' }}>
        <h1 style={{ fontSize: '30px' }}>Players</h1>

        <div>
          <input
            type="text"
            placeholder="Enter player name"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            style={{
              marginBottom: '10px',
              marginTop: '10px',
              marginRight: '5px',
              padding: '5px',
              border: '1px solid #EE2E31',
              borderRadius: '5px',
              outline: 'none'
            }}
          />
          <button
            onClick={handleAddPlayer}
            style={{
              backgroundColor: '#004f98',
              color: '#fff',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Add Player
          </button>
        </div>

        <input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            marginBottom: '10px',
            marginRight: '5px',
            padding: '5px',
            borderRadius: '5px',
            outline: 'none'
          }}
        />

        <ul style={{ listStyle: 'none', padding: 0, marginLeft: '5px' }}>
          {filteredPlayers.map((player, index) => (
            <li
              key={player.id}
              style={{
                color: index % 2 === 0 ? '#004f98' : '#EE2E31',
                marginBottom: '10px',
                borderBottom: '1px solid #000',
                paddingBottom: '5px'
              }}
            >
              {player.name}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};
