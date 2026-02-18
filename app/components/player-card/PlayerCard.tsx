import React, { useContext, useEffect, useState } from 'react';
import { CircleRemove } from './CircleRemove';
import { PlayerCardStat } from './PlayerCardStat';
import { PlayerCardGoalButton } from './PlayerCardGoalButton';
import { PlayerInfo } from '../../view/PlayerInfo';
import { CircleSkip } from './CircleSkip';
import { GameStateContext } from '@/app/context/GameStateContext';

interface PlayerCardProps {
  player: PlayerInfo;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const {
    name: playerName,
    goalsScored: goalsScoredProp,
    ownGoalsScored: ownGoalsScoredProp,
    skipped,
  } = player;

  const [goals, setGoals] = useState<number>(goalsScoredProp);
  const [ownGoals, setOwnGoals] = useState<number>(ownGoalsScoredProp);

  useEffect(() => {
    setGoals(goalsScoredProp);
  }, [goalsScoredProp]);

  useEffect(() => {
    setOwnGoals(ownGoalsScoredProp);
  }, [ownGoalsScoredProp]);

  const gameState = useContext(GameStateContext);

  if (gameState == null) {
    throw new Error('Must be used in GameStateContext');
  }

  const {
    pointStarted,
    playerIdRecordingGoal,
    playerIdRecordingOwnGoal,
    recordGoalScored,
    removePlayer,
    skipPlayer,
  } = gameState;

  const isScoringGoalsDisabled = !pointStarted || playerIdRecordingGoal != null;

  const handleGoalClick = () => {
    recordGoalScored(player, false);
  };

  const handleOwnGoalClick = () => {
    recordGoalScored(player, true);
  };

  return (
    <div className="z-0 relative bg-white border-slate-300 rounded-lg p-3 mb-5 w-[200px] shadow-lg text-black flex flex-col gap-2">
      <span className="flex gap-2 right-2 top-2 absolute">
        <CircleSkip
          skipped={skipped}
          onSkip={() => {
            skipPlayer(player);
          }}
        />
        <CircleRemove
          onRemove={() => {
            removePlayer(player);
          }}
        />
      </span>

      <h3 className="text-lg font-bold">{playerName}</h3>

      <div className="flex place-content-between">
        <PlayerCardStat text={`Goals: ${goals.toFixed()}`} />
        <PlayerCardStat text={`Own Goals: ${ownGoals.toFixed()}`} />
      </div>

      <div className="flex place-content-between">
        <PlayerCardGoalButton
          text="Goal"
          onClick={handleGoalClick}
          loading={playerIdRecordingGoal === player.id}
          disabled={isScoringGoalsDisabled}
        />
        <PlayerCardGoalButton
          text="Own Goal"
          onClick={handleOwnGoalClick}
          loading={playerIdRecordingOwnGoal === player.id}
          disabled={isScoringGoalsDisabled}
        />
      </div>
    </div>
  );
};

export default PlayerCard;
