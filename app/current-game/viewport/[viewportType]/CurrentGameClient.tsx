'use client';
import { $Enums, RotatyStrategy } from '@prisma/client';
import { useEffect, useRef, useState } from 'react';
import { Team } from '../../../components/team/Team';
import AddPlayerToTeam from '../../../components/AddPlayerToTeam';
import {
  addPlayerToCurrentGame,
  GameStateBroadcastPayload,
  removePlayerFromCurrentGame,
  reorderPlayer as reorderPlayerAction,
} from '../../../../lib/Game.actions';
import SettingsButton from '../../../components/SettingsButton';
import { SettingsModal } from '../../../components/settings-modal/SettingsModal';
import { WrapChildrenInSwiperIfMobile } from './WrapChildrenInSwiperIfMobile';

import 'swiper/css';
import { PlayerInfo } from '../../../view/PlayerInfo';
import { supabaseClient } from '../../../utils/supabase';
import { useRouter } from 'next/navigation';
import { useMessage } from '../../../context/MessageContext';
import { sortArrayByPropertyAsc } from '../../../utils/arrayUtils';
import { StartCurrentPointOverlay } from '../../../components/start-current-point/StartCurrentPointOverlay';
import { v4 as uuidv4 } from 'uuid';

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

  const latestOutstandingLocalGameStateMutationIdRef = useRef<string | null>(
    null,
  );

  // Function to register a game state mutation and get a mutation ID
  const registerGameStateMutation = () => {
    const mutationId = uuidv4();
    latestOutstandingLocalGameStateMutationIdRef.current = mutationId;
    return mutationId;
  };

  // TODO: should we instead have a list of outstanding mutation ids and remove only the one which errored?
  // Function to clear a game state mutation (e.g., on error)
  const clearGameStateMutation = () => {
    latestOutstandingLocalGameStateMutationIdRef.current = null;
  };

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
        const { currentGame, gameStateMutationId } =
          payload as GameStateBroadcastPayload;
        console.log('game state broadcast', gameStateMutationId);

        // Only update state if we're not awaiting our own mutation or if this is the response to our latest mutation
        if (
          currentGame != null &&
          (latestOutstandingLocalGameStateMutationIdRef.current === null ||
            latestOutstandingLocalGameStateMutationIdRef.current ===
              gameStateMutationId)
        ) {
          setPlayers(currentGame.players);
          setRedScore(currentGame.teamInfo.Red.score);
          setBlueScore(currentGame.teamInfo.Blue.score);
          setRedRotatyStrategy(currentGame.teamInfo.Red.rotatyStrategy);
          setBlueRotatyStrategy(currentGame.teamInfo.Blue.rotatyStrategy);
          setPointStarted(currentGame.pointStarted);
        }

        // If this is a response to our own mutation, clear the mutation ID reference
        if (
          gameStateMutationId ===
          latestOutstandingLocalGameStateMutationIdRef.current
        ) {
          console.log(
            'Received response for our mutation',
            gameStateMutationId,
          );
          latestOutstandingLocalGameStateMutationIdRef.current = null;
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
      const mutationId = registerGameStateMutation();
      await addPlayerToCurrentGame(playerId, team, mutationId);
    };
    action().catch((e: unknown) => {
      clearGameStateMutation();
      addErrorMessage(`Error adding player id ${playerId.toFixed()}`, e);
    });
  };

  const removePlayer = (player: PlayerInfo) => {
    setPlayers((state) => {
      return state.filter((playerInfo) => playerInfo.id !== player.id);
    });
    const action = async () => {
      const mutationId = registerGameStateMutation();
      await removePlayerFromCurrentGame(player.id, mutationId);
    };
    action().catch((e: unknown) => {
      clearGameStateMutation();
      addErrorMessage(`Error removing player id ${player.id.toFixed()}`, e);
    });
  };

  const reorderPlayer = (player: PlayerInfo, destinationIndex: number) => {
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
      const mutationId = registerGameStateMutation();
      await reorderPlayerAction(player.id, destinationIndex, mutationId);
    };
    action().catch((e: unknown) => {
      clearGameStateMutation();
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
        registerGameStateMutation={registerGameStateMutation}
        clearGameStateMutation={clearGameStateMutation}
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
              registerGameStateMutation={registerGameStateMutation}
              clearGameStateMutation={clearGameStateMutation}
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
              registerGameStateMutation={registerGameStateMutation}
              clearGameStateMutation={clearGameStateMutation}
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
