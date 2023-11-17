'use client';

import { $Enums, Player } from '@prisma/client';
import { FC, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';
import { PlayerInfo } from '../current-game/page';
import { getPlayers } from '../../lib/Player.actions';
import { addPlayerToCurrentGame } from '../../lib/Game.actions';

interface AddPlayerToTeamProps {
  team: $Enums.Team;
  addOptimisticPlayer: (player: {
    id: number;
    name: string;
    team: $Enums.Team;
  }) => void;
  existingPlayers: PlayerInfo[];
}

const AddPlayerToTeam: FC<AddPlayerToTeamProps> = ({
  team,
  addOptimisticPlayer,
  existingPlayers
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerFilter, setPlayerFilter] = useState('');

  const onClose = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await getPlayers();
      setPlayers(data);
    };
    loadData();
  }, []);

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(playerFilter.toLowerCase())
  );

  return (
    <>
      <button
        className={
          'my-5 p-3 bg-yellow-100 text-black rounded-md active:bg-yellow-200'
        }
        type="button"
        onClick={() => setShowModal(true)}
        disabled={isPending}
      >
        Add
      </button>
      <Modal show={showModal} onClose={onClose}>
        <div
          className={
            'min-w-[80vw] lg:min-w-[40vw] min-h-[50vh] lg:min-h-[30vh] max-h-[80vh]'
          }
        >
          <p>
            Add player to{' '}
            <span
              className={`font-bold ${
                team === $Enums.Team.Red ? 'text-team-red' : 'text-team-blue'
              }`}
            >
              Team {`${team}`}
            </span>
          </p>
          <input
            className={'mt-2 p-1 border border-gray-500'}
            placeholder={'Search player name...'}
            onChange={(e) => setPlayerFilter(e.currentTarget.value)}
          ></input>
          <ul className={'list-none mt-2 max-h-[70vh] overflow-y-auto'}>
            {filteredPlayers.map((player) => {
              const playerAlreadyInGame = existingPlayers
                .map((ePlayer) => ePlayer.id)
                .includes(player.id);
              return (
                <li
                  key={player.id}
                  className={`border-b not-l:border-b-black last:border-b-0 ${
                    team === $Enums.Team.Red
                      ? 'text-team-red'
                      : 'text-team-blue'
                  }`}
                >
                  <button
                    disabled={playerAlreadyInGame}
                    className={`pl-2 py-[5px] w-full text-left hover:font-bold hover:bg-opacity-20 ${
                      team === $Enums.Team.Red
                        ? 'hover:bg-team-red'
                        : 'hover:bg-team-blue'
                    }
                     ${
                       playerAlreadyInGame
                         ? 'line-through italic text-gray-300'
                         : ''
                     }`}
                    onClick={async () => {
                      onClose();
                      addOptimisticPlayer({
                        id: player.id,
                        name: player.name,
                        team
                      });
                      await addPlayerToCurrentGame(player.id, team);
                      router.refresh();
                    }}
                  >
                    {player.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </Modal>
    </>
  );
};

export default AddPlayerToTeam;
