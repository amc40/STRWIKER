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

import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import { PlayerInfo } from '../view/PlayerInfo';
import { supabaseClient } from '../utils/supabase';
import { GameInfo } from '../view/CurrentGameInfo';
import { useRouter } from 'next/navigation';

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
  serverGameId: number;
  serverRedScore: number;
  serverBlueScore: number;
  serverBlueRotatyStrategy: RotatyStrategy;
  serverRedRotatyStrategy: RotatyStrategy;
  serverPlayers: PlayerInfo[];
}> = ({
  serverGameId,
  serverRedScore,
  serverBlueScore,
  serverRedRotatyStrategy,
  serverBlueRotatyStrategy,
  serverPlayers,
}) => {
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

  const router = useRouter();

  useEffect(() => {
    const gameEndListener = supabaseClient
      .channel('current-game-end')
      .on('broadcast', { event: 'game-end' }, () => {
        router.replace(`/game/${serverGameId}/stats`);
      })
      .subscribe();

    const gameStateListener = supabaseClient
      .channel('current-game-state')
      .on('broadcast', { event: 'game-state' }, ({ payload }) => {
        const currentGameInfo = payload as GameInfo;
        setPlayers(currentGameInfo.players);
        setRedScore(currentGameInfo.teamInfo.Red.score);
        setBlueScore(currentGameInfo.teamInfo.Blue.score);
        setRedRotatyStrategy(currentGameInfo.teamInfo.Red.rotatyStrategy);
        setBlueRotatyStrategy(currentGameInfo.teamInfo.Blue.rotatyStrategy);
      })
      .subscribe();

    return () => {
      void gameStateListener.unsubscribe();
      void gameEndListener.unsubscribe();
    };
  }, [router, serverGameId]);

  useEffect(() => {
    awaitingPlayersResponseRef.current = awaitingPlayersResponse;
  }, [awaitingPlayersResponse]);

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
        goalsScored: 0,
        ownGoalsScored: 0,
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

  return (
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
  );
};
