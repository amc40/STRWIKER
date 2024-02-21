'use client';
import { $Enums } from '@prisma/client';
import { FC, useEffect, useRef, useState } from 'react';
import { Team } from '../components/Team';
import AddPlayerToTeam from '../components/AddPlayerToTeam';
import {
  PlayerInfo,
  addPlayerToCurrentGame,
  getCurrentGameInfo,
  removePlayerFromCurrentGame,
  reorderPlayer as reorderPlayerAction
} from '../../lib/Game.actions';
import SettingsButton from '../components/SettingsButton';
import { SettingsModal } from '../components/settings-modal/SettingsModal';
import { NoGameInProgress } from './NoGameInProgress';

import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

const MS_BETWEEN_REFRESHES = 1000;

const MOBILE_SCREEN_BREAK_POINT = 768;

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

  const [awaitingPlayersResponse, setAwaitingPlayersResponse] = useState(false);
  const awaitingPlayersResponseRef = useRef(awaitingPlayersResponse);

  useEffect(() => {
    awaitingPlayersResponseRef.current = awaitingPlayersResponse;
  }, [awaitingPlayersResponse]);

  // on initial render setup a function to refresh the current game info every MS_BETWEEN_REFRESHES
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      const currentGameInfo = await getCurrentGameInfo();
      console.log(
        'refresh: awaitingPlayersResponseRef',
        awaitingPlayersResponseRef.current
      );
      if (currentGameInfo.gameInProgress) {
        if (awaitingPlayersResponseRef.current) return;
        setPlayers(currentGameInfo.players);
        setRedScore(currentGameInfo.redScore);
        setBlueScore(currentGameInfo.blueScore);
      } else {
        setGameInProgress(false);
      }
    }, MS_BETWEEN_REFRESHES);
    return () => clearInterval(refreshInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPlayer = async (
    playerId: number,
    playerName: string,
    team: $Enums.Team
  ) => {
    setAwaitingPlayersResponse(true);
    setPlayers((state) => [
      ...state,
      {
        id: playerId,
        name: playerName,
        team,
        position: Math.max(...state.map((player) => player.position)) + 1
      }
    ]);
    const action = async () => {
      try {
        await addPlayerToCurrentGame(playerId, team);
      } finally {
        setAwaitingPlayersResponse(false);
      }
    };
    action();
  };

  const removePlayer = async (player: PlayerInfo) => {
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
    action();
  };

  const reorderPlayer = async (
    player: PlayerInfo,
    destinationIndex: number
  ) => {
    setAwaitingPlayersResponse(true);

    setPlayers((state) => {
      try {
        return state.map((playerInfo) =>
          updatePlayerOrderAfterReorder(playerInfo, player, destinationIndex)
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
    action();
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
          <Swiper>
            <SwiperSlide>
              <div className="h-full flex">
                <Team
                  team={$Enums.Team.Blue}
                  members={players
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
                  members={players
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
              members={players
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
              members={players
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
