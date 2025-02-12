import React, { useEffect, useState } from 'react';
import { recordGoalScored } from '../../../lib/Game.actions';
import { CircleRemove } from './CircleRemove';
import { PlayerCardStat } from './PlayerCardStat';
import { PlayerCardGoalButton } from './PlayerCardGoalButton';
import { PlayerInfo } from '../../view/PlayerInfo';
import { useMessage } from '../../context/MessageContext';
import { CircleSkip } from './CircleSkip';

interface PlayerCardProps {
  player: PlayerInfo;
  removePlayer: (player: PlayerInfo) => void;
  scoringGoalsDisabled: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  removePlayer,
  scoringGoalsDisabled,
}) => {
  const {
    name: playerName,
    goalsScored: goalsScoredProp,
    ownGoalsScored: ownGoalsScoredProp,
  } = player;

  const [goals, setGoals] = useState<number>(goalsScoredProp);
  const [ownGoals, setOwnGoals] = useState<number>(ownGoalsScoredProp);

  useEffect(() => {
    setGoals(goalsScoredProp);
  }, [goalsScoredProp]);

  useEffect(() => {
    setOwnGoals(ownGoalsScoredProp);
  }, [ownGoalsScoredProp]);

  const [recordingGoal, setRecordingGoal] = useState(false);
  const [recordingOwnGoal, setRecordingOwnGoal] = useState(false);

  const { addErrorMessage } = useMessage();

  const handleGoalClick = () => {
    setRecordingGoal(true);
    recordGoalScored(player, false)
      .catch((e: unknown) => {
        addErrorMessage('Error recording goal', e);
      })
      .finally(() => {
        setRecordingGoal(false);
      });
  };

  const handleOwnGoalClick = () => {
    setRecordingOwnGoal(true);
    recordGoalScored(player, true)
      .catch((e: unknown) => {
        addErrorMessage('Error recording goal', e);
      })
      .finally(() => {
        setRecordingOwnGoal(false);
      });
  };

  const [skipped, setSkipped] = useState(false);

  return (
    <div className="z-0 relative bg-white border-slate-300 rounded-lg p-3 mb-5 w-[200px] shadow-lg text-black flex flex-col gap-2">
      <span className="flex gap-2 right-2 top-2 absolute">
        <CircleSkip
          skipped={skipped}
          onSkip={() => {
            setSkipped((skipped) => !skipped);
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
          loading={recordingGoal}
          disabled={scoringGoalsDisabled}
        />
        <PlayerCardGoalButton
          text="Own Goal"
          onClick={handleOwnGoalClick}
          loading={recordingOwnGoal}
          disabled={scoringGoalsDisabled}
        />
      </div>
    </div>
  );
};

export default PlayerCard;
