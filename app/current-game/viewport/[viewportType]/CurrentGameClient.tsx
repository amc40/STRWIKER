'use client';
import { $Enums, RotatyStrategy } from '@prisma/client';
import { useMemo, useState } from 'react';
import { Team } from '../../../components/team/Team';
import SettingsButton from '../../../components/SettingsButton';
import { SettingsModal } from '../../../components/settings-modal/SettingsModal';
import { WrapChildrenInSwiperIfMobile } from './WrapChildrenInSwiperIfMobile';

import 'swiper/css';
import { PlayerInfo } from '../../../view/PlayerInfo';
import { GameStateProvider } from '@/app/context/GameStateContext';
import { GameInfo } from '@/app/view/GameInfo';

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
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const openSettingsModal = () => {
    setShowSettingsModal(true);
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
  };

  const initialGameInfo: GameInfo = useMemo(
    () => ({
      gameId: serverGameId,
      players: serverPlayers,
      teamInfo: {
        Red: {
          score: serverRedScore,
          rotatyStrategy: serverRedRotatyStrategy,
        },
        Blue: {
          score: serverBlueScore,
          rotatyStrategy: serverBlueRotatyStrategy,
        },
      },
      pointStarted: serverPointStarted,
    }),
    [
      serverBlueRotatyStrategy,
      serverBlueScore,
      serverGameId,
      serverPlayers,
      serverPointStarted,
      serverRedRotatyStrategy,
      serverRedScore,
    ],
  );

  return (
    <GameStateProvider initialGameInfo={initialGameInfo}>
      <main className="flex-grow overflow-y-hidden">
        <span className="z-10 fixed right-10 md:right-20 bottom-10 inline-block">
          <SettingsButton
            onClick={() => {
              setShowSettingsModal(true);
            }}
          />
        </span>
        <SettingsModal show={showSettingsModal} onClose={closeSettingsModal} />
        <div className="h-full flex flex-col">
          <div className="flex flex-1 flex-row overflow-y-auto">
            <WrapChildrenInSwiperIfMobile isMobile={isMobile}>
              <Team
                team={$Enums.Team.Blue}
                openSettingsModal={openSettingsModal}
              />

              <Team
                team={$Enums.Team.Red}
                openSettingsModal={openSettingsModal}
              />
            </WrapChildrenInSwiperIfMobile>
          </div>

          {/* {!pointStarted && <StartCurrentPointOverlay />} */}
        </div>
      </main>
    </GameStateProvider>
  );
};
