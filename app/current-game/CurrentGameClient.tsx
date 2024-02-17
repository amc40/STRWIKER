'use client';
import { $Enums } from '@prisma/client';
import { FC, useEffect, useState } from 'react';
import { experimental_useOptimistic as useOptimistic } from 'react';
import { Team } from '../components/Team';
import AddPlayerToTeam from '../components/AddPlayerToTeam';
import {
  PlayerInfo,
  addPlayerToCurrentGame,
  clearCurrentGamePlayers,
  getCurrentGameInfo,
  removePlayerFromCurrentGame,
  reorderPlayer as reorderPlayerAction
} from '../../lib/Game.actions';
import SettingsButton from '../components/SettingsButton';
import { SettingsModal } from '../components/SettingsModal';
import { NoGameInProgress } from './NoGameInProgress';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

const MS_BETWEEN_REFRESHES = 1000;

const MOBILE_SCREEN_BREAK_POINT = 768;

enum OptimisticAction {
  ADD,
  CLEAR,
  REMOVE,
  REORDER
}

type SetOptimisticPlayerArgs =
  | {
      action: OptimisticAction.ADD;
      player: PlayerInfo;
      destinationIndex: undefined;
    }
  | {
      action: OptimisticAction.CLEAR;
      player: undefined;
      destinationIndex: undefined;
    }
  | {
      action: OptimisticAction.REMOVE;
      player: PlayerInfo;
      destinationIndex: undefined;
    }
  | {
      action: OptimisticAction.REORDER;
      player: PlayerInfo;
      destinationIndex: number;
    };

const updatePlayerOrderAfterReorder = (
  player: PlayerInfo,
  playerReordered: PlayerInfo,
  destinationIndex: number
): PlayerInfo => {
  if (player.team !== playerReordered.team) {
    return player;
  }

  if (player.id === playerReordered.id) {
    return {
      ...player,
      position: destinationIndex
    };
  }

  if (player.position === playerReordered.position) {
    throw new Error(
      `Not playerReordered, but positions before reordered match. player: ${JSON.stringify(
        player
      )}, playerReordered: ${JSON.stringify(
        playerReordered
      )}, destinationIndex: ${destinationIndex}`
    );
  }

  if (player.position < playerReordered.position) {
    if (player.position < destinationIndex) {
      return player;
    }
    return {
      ...player,
      position: player.position + 1
    };
  }

  if (player.position > destinationIndex) {
    return player;
  }

  return {
    ...player,
    position: player.position - 1
  };
};

export const CurrentGameClient: FC<{
  serverRedScore: number;
  serverBlueScore: number;
  serverPlayers: PlayerInfo[];
}> = ({ serverRedScore, serverBlueScore, serverPlayers }) => {
  const [gameInProgress, setGameInProgress] = useState(true);
  const [players, setPlayers] = useState(serverPlayers);
  const [redScore, setRedScore] = useState(serverRedScore);
  const [blueScore, setBlueScore] = useState(serverBlueScore);

  // on initial render setup a function to refresh the current game info every MS_BETWEEN_REFRESHES
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      const currentGameInfo = await getCurrentGameInfo();
      if (currentGameInfo.gameInProgress) {
        setPlayers(currentGameInfo.players);
        setRedScore(currentGameInfo.redScore);
        setBlueScore(currentGameInfo.blueScore);
      } else {
        setGameInProgress(false);
      }
    }, MS_BETWEEN_REFRESHES);
    return () => clearInterval(refreshInterval);
  }, []);

  const [optimisticPlayers, setOptimisticPlayers] = useOptimistic(
    players,
    (
      state: PlayerInfo[],
      { action, player, destinationIndex }: SetOptimisticPlayerArgs
    ) => {
      switch (action) {
        case OptimisticAction.ADD:
          return [...state, player];
        case OptimisticAction.CLEAR:
          return [];
        case OptimisticAction.REMOVE:
          return state.filter((playerInfo) => playerInfo.id !== player.id);
        case OptimisticAction.REORDER:
          try {
            return state.map((playerInfo) =>
              updatePlayerOrderAfterReorder(
                playerInfo,
                player,
                destinationIndex
              )
            );
          } catch (e) {
            console.error(e);
            return players;
          }
        default:
          return [];
      }
    }
  );

  const addPlayer = async (
    playerId: number,
    playerName: string,
    team: $Enums.Team
  ) => {
    setOptimisticPlayers({
      action: OptimisticAction.ADD,
      player: {
        id: playerId,
        name: playerName,
        team,
        // should be added at the end
        position: Number.MAX_SAFE_INTEGER
      },
      destinationIndex: undefined
    });
    await addPlayerToCurrentGame(playerId, team);
  };

  const removePlayer = async (player: PlayerInfo) => {
    setOptimisticPlayers({
      action: OptimisticAction.REMOVE,
      player,
      destinationIndex: undefined
    });
    await removePlayerFromCurrentGame(player.id);
  };

  const reorderPlayer = async (
    player: PlayerInfo,
    destinationIndex: number
  ) => {
    setOptimisticPlayers({
      action: OptimisticAction.REORDER,
      player,
      destinationIndex
    });
    await reorderPlayerAction(player.id, destinationIndex);
  };

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < MOBILE_SCREEN_BREAK_POINT);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return gameInProgress ? (
    <main className="flex flex-1 flex-col">
      <span className="z-10 fixed right-10 md:right-20 bottom-10 inline-block">
        <SettingsButton onClick={() => setShowSettingsModal(true)} />
      </span>
      <SettingsModal
        show={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
      <div className="flex flex-1">
        {isMobile ? (
          <Swiper
            pagination={{
              clickable: true
            }}
            modules={[Pagination]}
          >
            <SwiperSlide>
              <div className="h-full flex">
                <Team
                  team={$Enums.Team.Blue}
                  members={optimisticPlayers
                    .filter((player) => player.team === 'Blue')
                    .sort((a, b) => a.position - b.position)}
                  score={blueScore}
                  removePlayer={removePlayer}
                  reorderPlayer={reorderPlayer}
                >
                  <AddPlayerToTeam
                    team={$Enums.Team.Blue}
                    addPlayer={addPlayer}
                    existingPlayers={players}
                  />
                </Team>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="h-full flex">
                <Team
                  team={$Enums.Team.Red}
                  members={optimisticPlayers
                    .filter((player) => player.team === 'Red')
                    .sort((a, b) => a.position - b.position)}
                  score={redScore}
                  removePlayer={removePlayer}
                  reorderPlayer={reorderPlayer}
                >
                  <AddPlayerToTeam
                    team={$Enums.Team.Red}
                    addPlayer={addPlayer}
                    existingPlayers={players}
                  />
                </Team>
              </div>
            </SwiperSlide>
          </Swiper>
        ) : (
          <>
            <Team
              team={$Enums.Team.Blue}
              members={optimisticPlayers
                .filter((player) => player.team === 'Blue')
                .sort((a, b) => a.position - b.position)}
              score={blueScore}
              removePlayer={removePlayer}
              reorderPlayer={reorderPlayer}
            >
              <AddPlayerToTeam
                team={$Enums.Team.Blue}
                addPlayer={addPlayer}
                existingPlayers={players}
              />
            </Team>
            <Team
              team={$Enums.Team.Red}
              members={optimisticPlayers
                .filter((player) => player.team === 'Red')
                .sort((a, b) => a.position - b.position)}
              score={redScore}
              removePlayer={removePlayer}
              reorderPlayer={reorderPlayer}
              // The initial render wil be for the desktop site, but we don't want to show the Red on the small screens
              hideOnSmallScreen={true}
            >
              <AddPlayerToTeam
                team={$Enums.Team.Red}
                addPlayer={addPlayer}
                existingPlayers={players}
              />
            </Team>
          </>
        )}
      </div>
    </main>
  ) : (
    <NoGameInProgress />
  );
};
