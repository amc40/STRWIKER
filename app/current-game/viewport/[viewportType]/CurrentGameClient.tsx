'use client';
import { $Enums, RotatyStrategy } from '@prisma/client';
import { useEffect, useRef, useState } from 'react';
import { Team } from '../../../components/team/Team';
import AddPlayerToTeam from '../../../components/AddPlayerToTeam';
import {
  addPlayerToCurrentGame,
  removePlayerFromCurrentGame,
  reorderPlayer as reorderPlayerAction,
} from '../../../../lib/Game.actions';
import SettingsButton from '../../../components/SettingsButton';
import { SettingsModal } from '../../../components/settings-modal/SettingsModal';
import { WrapChildrenInSwiperIfMobile } from './WrapChildrenInSwiperIfMobile';

import 'swiper/css';
import { PlayerInfo } from '../../../view/PlayerInfo';
import { supabaseClient } from '../../../utils/supabase';
import { GameInfo } from '../../../view/CurrentGameInfo';
import { useRouter } from 'next/navigation';
import { useMessage } from '../../../context/MessageContext';
import { sortArrayByPropertyAsc } from '../../../utils/arrayUtils';
import { StartCurrentPointOverlay } from '../../../components/start-current-point/StartCurrentPointOverlay';

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
      )}, destinationIndex: ${destinationIndex.toFixed()}`,
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

interface CurrentGameClientProps {
  serverGameId: number;
  serverRedScore: number;
  serverBlueScore: number;
  serverBlueRotatyStrategy: RotatyStrategy;
  serverRedRotatyStrategy: RotatyStrategy;
  serverPlayers: PlayerInfo[];
  serverPointStarted: boolean;
  isMobile: boolean;
}

export const CurrentGameClient: React.FC<CurrentGameClientProps> = ({
  serverGameId,
  serverRedScore,
  serverBlueScore,
  serverRedRotatyStrategy,
  serverBlueRotatyStrategy,
  serverPlayers,
  serverPointStarted,
  isMobile,
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
  const [pointStarted, setPointStarted] = useState(serverPointStarted);

  const [awaitingPlayersMutation, setAwaitingPlayersMutation] = useState(false);
  // this prevents the value of awaitingPlayersMutation being captured by the closure in the refresh useEffect
  const awaitingPlayersMutationRef = useRef(awaitingPlayersMutation);

  useEffect(() => {
    awaitingPlayersMutationRef.current = awaitingPlayersMutation;
  }, [awaitingPlayersMutation]);

  const router = useRouter();

  useEffect(() => {
    const gameEndListener = supabaseClient
      .channel('current-game-end')
      .on('broadcast', { event: 'game-end' }, () => {
        router.replace(`/game/${serverGameId.toFixed()}/stats`);
      })
      .subscribe();

    const gameStateListener = supabaseClient
      .channel('current-game-state')
      .on('broadcast', { event: 'game-state' }, ({ payload }) => {
        const currentGameInfo = payload as GameInfo;
        // we won't visually update the state while we've got mutations of ourselves waiting to be applied, otherwise they will undo and re-apply when the corresponding state update it made
        // if we need to update our state based on other user's actions we can wait until we get the state update from our mutation
        if (!awaitingPlayersMutationRef.current) {
          setPlayers(currentGameInfo.players);
          setRedScore(currentGameInfo.teamInfo.Red.score);
          setBlueScore(currentGameInfo.teamInfo.Blue.score);
          setRedRotatyStrategy(currentGameInfo.teamInfo.Red.rotatyStrategy);
          setBlueRotatyStrategy(currentGameInfo.teamInfo.Blue.rotatyStrategy);
          setPointStarted(currentGameInfo.pointStarted);
        }
      })
      .subscribe();

    return () => {
      void gameStateListener.unsubscribe();
      void gameEndListener.unsubscribe();
    };
  }, [router, serverGameId]);

  const { addErrorMessage } = useMessage();

  const addPlayer = (
    playerId: number,
    playerName: string,
    team: $Enums.Team,
  ) => {
    setAwaitingPlayersMutation(true);
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
        setAwaitingPlayersMutation(false);
      }
    };
    action().catch((e: unknown) => {
      addErrorMessage(`Error adding player id ${playerId.toFixed()}`, e);
    });
  };

  const removePlayer = (player: PlayerInfo) => {
    setAwaitingPlayersMutation(true);
    setPlayers((state) => {
      return state.filter((playerInfo) => playerInfo.id !== player.id);
    });
    const action = async () => {
      try {
        await removePlayerFromCurrentGame(player.id);
      } finally {
        setAwaitingPlayersMutation(false);
      }
    };
    action().catch((e: unknown) => {
      addErrorMessage(`Error removing player id ${player.id.toFixed()}`, e);
    });
  };

  const reorderPlayer = (player: PlayerInfo, destinationIndex: number) => {
    setAwaitingPlayersMutation(true);

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
        setAwaitingPlayersMutation(false);
      }
    };
    action().catch((e: unknown) => {
      addErrorMessage(
        `Error reordering player id ${player.id.toFixed()} to position ${destinationIndex.toFixed()}`,
        e,
      );
    });
  };

  const [showSettingsModal, setShowSettingsModal] = useState(false);

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

  const scoringGoalsDisabled = !pointStarted;

  return (
    <main className="flex-grow overflow-y-hidden">
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
      <div className="h-full flex flex-col">
        <div className="flex flex-1 flex-row overflow-y-auto">
          <WrapChildrenInSwiperIfMobile isMobile={isMobile}>
            <Team
              team={$Enums.Team.Blue}
              members={sortArrayByPropertyAsc(
                players.filter((player) => player.team === 'Blue'),
                ({ position }) => position,
              )}
              score={blueScore}
              rotatyStrategy={blueRotatyStrategy}
              scoringGoalsDisabled={scoringGoalsDisabled}
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
              members={sortArrayByPropertyAsc(
                players.filter((player) => player.team === 'Red'),
                ({ position }) => position,
              )}
              score={redScore}
              rotatyStrategy={redRotatyStrategy}
              scoringGoalsDisabled={scoringGoalsDisabled}
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
          </WrapChildrenInSwiperIfMobile>
        </div>

        {!pointStarted && <StartCurrentPointOverlay />}
      </div>
    </main>
  );
};
