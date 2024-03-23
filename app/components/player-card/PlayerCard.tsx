import React, { useEffect, useState } from 'react';
import {
  getNumberOfGoalsScoredByPlayerInCurrentGame,
  recordGoalScored
} from '../../../lib/Game.actions';
import { CircleRemove } from './CircleRemove';
import { PlayerCardStat } from './PlayerCardStat';
import { PlayerCardGoalButton } from './PlayerCardGoalButton';
import { PlayerInfo } from '../../view/PlayerInfo';

interface PlayerCardProps {
  player: PlayerInfo;
  removePlayer: (player: PlayerInfo) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, removePlayer }) => {
  const { name: playerName, id: playerId } = player;

  const [goals, setGoals] = useState<number | null>(null);
  const [ownGoals, setOwnGoals] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const fetchNumberOfGoalsScored = async () => {
        const numberOfGoalsScoredByPlayer =
          await getNumberOfGoalsScoredByPlayerInCurrentGame(playerId);
        if (numberOfGoalsScoredByPlayer != null) {
          setGoals(numberOfGoalsScoredByPlayer.goalScored);
          setOwnGoals(numberOfGoalsScoredByPlayer.ownGoalsScored);
        }
      };
      fetchNumberOfGoalsScored().catch((e) => {
        console.error(
          `Error fetching number of goals scored by player id ${playerId}:`,
          e
        );
      });
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [playerId]);

  const handleGoalClick = () => {
    setGoals((goals ?? 0) + 1);
    recordGoalScored(player, false).catch((e) => {
      console.error('Error recording goal:', e);
    });
  };

  const handleOwnGoalClick = () => {
    setOwnGoals((ownGoals ?? 0) + 1);
    recordGoalScored(player, true).catch((e) => {
      console.error('Error recording own goal:', e);
    });
  };

  return (
    <div className="z-0 relative bg-white border-slate-300 rounded-lg p-2 mb-5 w-[200px] shadow-lg text-center text-black">
      <span className="right-2 top-2 absolute inline-block">
        <CircleRemove
          onRemove={() => {
            removePlayer(player);
          }}
        />
      </span>
      <h3 className="my-1 text-lg font-bold">{playerName}</h3>

      <PlayerCardStat text={`Goals: ${goals ?? '-'}`} />
      <PlayerCardStat text={`Own Goals: ${ownGoals ?? '-'}`} />
      <div className="flex place-content-around">
        <PlayerCardGoalButton text="Goal" onClick={handleGoalClick} />
        <PlayerCardGoalButton text="Own Goal" onClick={handleOwnGoalClick} />
      </div>
    </div>
  );
};

export default PlayerCard;
