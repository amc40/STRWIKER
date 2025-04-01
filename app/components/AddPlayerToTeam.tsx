'use client';

import { $Enums, Player, Team } from '@prisma/client';
import { FC, useEffect, useState, useTransition } from 'react';
import Modal from './Modal';
import { getPlayers } from '../../lib/Player.actions';
import { PlayerInfo } from '../view/PlayerInfo';
import { Plus } from './icons/Plus';
import { useMessage } from '../context/MessageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddPlayerToTeamProps {
  team: $Enums.Team;
  addPlayer: (playerId: number, playerName: string, team: Team) => void;
  existingPlayers: PlayerInfo[];
}

const AddPlayerToTeam: FC<AddPlayerToTeamProps> = ({
  team,
  addPlayer,
  existingPlayers,
}) => {
  const [isPending] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerFilter, setPlayerFilter] = useState('');

  const onClose = () => {
    setShowModal(false);
  };

  const { addErrorMessage } = useMessage();

  useEffect(() => {
    const loadData = async () => {
      // TODO: this shouldn't be an action - it should be a GET endpoint
      const data = await getPlayers();
      setPlayers(data);
    };
    loadData().catch((e: unknown) => {
      addErrorMessage('Failed to fetch players', e);
    });
  }, [addErrorMessage]);

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(playerFilter.toLowerCase()),
  );

  return (
    <>
      <Button
        variant="secondary"
        // TODO: This width is hard-coded to match the width of the player card currently which is absolute garbage, but I've got fed up of fiddling with css
        className="flex w-[200px]"
        onClick={() => {
          setShowModal(true);
        }}
        disabled={isPending}
      >
        <Plus />
        Add Player
      </Button>
      <Modal
        title={
          <>
            Add player to{' '}
            <span
              className={`font-bold ${
                team === $Enums.Team.Red ? 'text-team-red' : 'text-team-blue'
              }`}
            >
              Team {team}
            </span>
          </>
        }
        show={showModal}
        onClose={onClose}
      >
        <div
          className={
            'min-w-[80vw] lg:min-w-[40vw] min-h-[50vh] lg:min-h-[30vh] max-h-[80vh]'
          }
        >
          <Input
            className="mt-2"
            placeholder="Search player name..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPlayerFilter(e.target.value);
            }}
          />
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
                  <Button
                    variant="ghost"
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
                    onClick={() => {
                      addPlayer(player.id, player.name, team);
                    }}
                  >
                    {player.name}
                  </Button>
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
