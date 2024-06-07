'use client';
import { $Enums, RotatyStrategy } from '@prisma/client';
import { FC, useEffect, useRef, useState } from 'react';
import { Team } from '../components/team/Team';
import AddPlayerToTeam from '../components/AddPlayerToTeam';
import {
  addPlayerToCurrentGame,
  removePlayerFromCurrentGame,
  reorderPlayer as reorderPlayerAction,
} from '../../lib/Game.actions';
import SettingsButton from '../components/SettingsButton';
import { SettingsModal } from '../components/settings-modal/SettingsModal';
import { NoGameInProgress } from './NoGameInProgress';

import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import { PlayerInfo } from '../view/PlayerInfo';
import { fetchCurrentGameInfo } from '../network/fetchCurrentGameInfo';
import { supabaseClient } from '../utils/supabase';

const MS_BETWEEN_REFRESHES = 1000;

const MOBILE_SCREEN_BREAK_POINT = 768;

const updatePlayerOrderAfterReorder = (
  player: PlayerInfo,
  playerReordered: PlayerInfo,
  destinationIndex: number,
): PlayerInfo => {
  if (player.team !== playerReordered.team) {
    return player;
  }

  if (player.id === playerReordered.id) {
    return {
      ...player,
      position: destinationIndex,
    };
  }

  if (player.position === playerReordered.position) {
    throw new Error(
      `Not playerReordered, but positions before reordered match. player: ${JSON.stringify(
        player,
      )}, playerReordered: ${JSON.stringify(
        playerReordered,
      )}, destinationIndex: ${destinationIndex}`,
    );
  }

  if (player.position < playerReordered.position) {
    if (player.position < destinationIndex) {
      return player;
    }
    return {
      ...player,
      position: player.position + 1,
    };
  }

  if (player.position > destinationIndex) {
    return player;
  }

  return {
    ...player,
    position: player.position - 1,
  };
};

export const CurrentGameClient: FC<{
  serverRedScore: number;
  serverBlueScore: number;
  serverBlueRotatyStrategy: RotatyStrategy;
  serverRedRotatyStrategy: RotatyStrategy;
  serverPlayers: PlayerInfo[];
}> = ({
  serverRedScore,
  serverBlueScore,
  serverRedRotatyStrategy,
  serverBlueRotatyStrategy,
  serverPlayers,
}) => {
  const [gameInProgress, setGameInProgress] = useState(true);
  const [players, setPlayers] = useState(serverPlayers);
  const [redScore, setRedScore] = useState(serverRedScore);
  const [blueScore, setBlueScore] = useState(serverBlueScore);
  const [redRotatyStrategy, setRedRotatyStrategy] = useState(
    serverRedRotatyStrategy,
  );
  const [blueRotatyStrategy, setBlueRotatyStrategy] = useState(
    serverBlueRotatyStrategy,
  );

  const [awaitingPlayersResponse, setAwaitingPlayersResponse] = useState(false);
  // this prevents the value of awaitingPlayersResponse being captured by the closure in the refresh useEffect
  const awaitingPlayersResponseRef = useRef(awaitingPlayersResponse);

  useEffect(() => {
    awaitingPlayersResponseRef.current = awaitingPlayersResponse;
  }, [awaitingPlayersResponse]);

  useEffect(() => {
    const taskListener = supabaseClient
      .channel('test')
      .on('broadcast', { event: 'test' }, (payload) => {
        console.log('Change received!', payload);
      })
      .subscribe();

    // add return right here!
    return () => void taskListener.unsubscribe();
  }, []);

  // on initial render setup a function to refresh the current game info every MS_BETWEEN_REFRESHES
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      const updateCurrentGameInfo = async () => {
        const currentGameInfo = await fetchCurrentGameInfo();
        if (currentGameInfo != null) {
          if (awaitingPlayersResponseRef.current) return;
          setPlayers(currentGameInfo.players);
          setRedScore(currentGameInfo.teamInfo.Red.score);
          setBlueScore(currentGameInfo.teamInfo.Blue.score);
          setRedRotatyStrategy(currentGameInfo.teamInfo.Red.rotatyStrategy);
          setBlueRotatyStrategy(currentGameInfo.teamInfo.Blue.rotatyStrategy);
        } else {
          setGameInProgress(false);
        }
      };
      updateCurrentGameInfo().catch((e) => {
        console.error('Error updating current game info:', e);
      });
    }, MS_BETWEEN_REFRESHES);
    return () => {
      clearInterval(refreshInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPlayer = (
    playerId: number,
    playerName: string,
    team: $Enums.Team,
  ) => {
    setAwaitingPlayersResponse(true);
    setPlayers((state) => [
      ...state,
      {
        id: playerId,
        name: playerName,
        team,
        position: Math.max(...state.map((player) => player.position)) + 1,
      },
    ]);
    const action = async () => {
      try {
        await addPlayerToCurrentGame(playerId, team);
      } finally {
        setAwaitingPlayersResponse(false);
      }
    };
    action().catch((e) => {
      console.error(`Error adding player id ${playerId}:`, e);
    });
  };

  const removePlayer = (player: PlayerInfo) => {
    setAwaitingPlayersResponse(true);
    setPlayers((state) => {
      return state.filter((playerInfo) => playerInfo.id !== player.id);
    });
    const action = async () => {
      try {
        await removePlayerFromCurrentGame(player.id);
      } finally {
        setAwaitingPlayersResponse(false);
      }
    };
    action().catch((e) => {
      console.error(`Error removing player id ${player.id}:`, e);
    });
  };

  const reorderPlayer = (player: PlayerInfo, destinationIndex: number) => {
    setAwaitingPlayersResponse(true);

    setPlayers((state) => {
      try {
        return state.map((playerInfo) =>
          updatePlayerOrderAfterReorder(playerInfo, player, destinationIndex),
        );
      } catch (e) {
        console.error(e);
        return players;
      }
    });

    const action = async () => {
      try {
        await reorderPlayerAction(player.id, destinationIndex);
      } finally {
        setAwaitingPlayersResponse(false);
      }
    };
    action().catch((e) => {
      console.error(
        `Error reordering player id ${player.id} to position ${destinationIndex}:`,
        e,
      );
    });
  };

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < MOBILE_SCREEN_BREAK_POINT);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const openSettingsModal = () => {
    setShowSettingsModal(true);
  };

  const setRotatyStrategy = (
    team: $Enums.Team,
    rotatyStrategy: RotatyStrategy,
  ) => {
    if (team === $Enums.Team.Red) {
      setRedRotatyStrategy(rotatyStrategy);
    } else {
      setBlueRotatyStrategy(rotatyStrategy);
    }
  };

  return gameInProgress ? (
    <main className="flex flex-1 flex-col">
      <span className="z-10 fixed right-10 md:right-20 bottom-10 inline-block">
        <SettingsButton
          onClick={() => {
            setShowSettingsModal(true);
          }}
        />
      </span>
      <SettingsModal
        show={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false);
        }}
        redRotatyStrategy={redRotatyStrategy}
        blueRotatyStrategy={blueRotatyStrategy}
        setRotatyStrategy={setRotatyStrategy}
      />
      <div className="flex flex-1">
        {isMobile ? (
          <Swiper>
            <SwiperSlide>
              <div className="h-full flex">
                <Team
                  team={$Enums.Team.Blue}
                  members={players
                    .filter((player) => player.team === 'Blue')
                    .sort((a, b) => a.position - b.position)}
                  score={blueScore}
                  rotatyStrategy={blueRotatyStrategy}
                  removePlayer={removePlayer}
                  reorderPlayer={reorderPlayer}
                  openSettingsModal={openSettingsModal}
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
                  members={players
                    .filter((player) => player.team === 'Red')
                    .sort((a, b) => a.position - b.position)}
                  score={redScore}
                  rotatyStrategy={redRotatyStrategy}
                  removePlayer={removePlayer}
                  reorderPlayer={reorderPlayer}
                  openSettingsModal={openSettingsModal}
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
              members={players
                .filter((player) => player.team === 'Blue')
                .sort((a, b) => a.position - b.position)}
              score={blueScore}
              rotatyStrategy={blueRotatyStrategy}
              removePlayer={removePlayer}
              reorderPlayer={reorderPlayer}
              openSettingsModal={openSettingsModal}
            >
              <AddPlayerToTeam
                team={$Enums.Team.Blue}
                addPlayer={addPlayer}
                existingPlayers={players}
              />
            </Team>
            <Team
              team={$Enums.Team.Red}
              members={players
                .filter((player) => player.team === 'Red')
                .sort((a, b) => a.position - b.position)}
              score={redScore}
              rotatyStrategy={redRotatyStrategy}
              removePlayer={removePlayer}
              reorderPlayer={reorderPlayer}
              openSettingsModal={openSettingsModal}
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
