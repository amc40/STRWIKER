import React, { useEffect, useState } from 'react';
import {
  PlayerInfo,
  getNumberOfGoalsScoredByPlayerInCurrentGame,
  recordGoalScored
} from '../../lib/Game.actions';
import { CircleRemove } from './CircleRemove';

interface PlayerCardProps {
  player: PlayerInfo;
  removePlayer: (player: PlayerInfo) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, removePlayer }) => {
  const { name: playerName, id: playerId } = player;

  const [goals, setGoals] = useState<number | null>(null);
  const [ownGoals, setOwnGoals] = useState<number | null>(null);
  const x: React.CSSProperties = { textAlign: 'center' };

  useEffect(() => {
    const interval = setInterval(async () => {
      const { goalScored, ownGoalsScored } =
        await getNumberOfGoalsScoredByPlayerInCurrentGame(playerId);
      setGoals(goalScored);
      setOwnGoals(ownGoalsScored);
    }, 1000);
    return () => clearInterval(interval);
  }, [playerId]);

  const handleGoalClick = () => {
    setGoals((goals ?? 0) + 1);
    recordGoalScored(player, false);
  };

  const handleOwnGoalClick = () => {
    setOwnGoals((ownGoals ?? 0) + 1);
    recordGoalScored(player, true);
  };

  return (
    <div className="z-0" style={styles.card}>
      <div className="relative">
        <h3 style={styles.playerName}>{playerName}</h3>
        <span className="right-0 top-0 absolute inline-block">
          <CircleRemove onRemove={() => removePlayer(player)} />
        </span>
      </div>

      <p style={styles.stat}>Goals: {goals ?? '-'}</p>
      <p style={styles.stat}>Own Goals: {ownGoals ?? '-'}</p>
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={handleGoalClick}>
          Goal
        </button>
        <button style={styles.button} onClick={handleOwnGoalClick}>
          Own Goal
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    border: '1px solid #ccc',
    padding: '10px',
    margin: '10px',
    maxWidth: '200px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    textAlign: 'center',
    color: 'black',
    position: 'relative'
  },
  playerName: {
    margin: '10px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'black'
  },
  stat: {
    margin: '5px 0',
    fontSize: '14px',
    color: 'black'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-around'
  },
  button: {
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: '#fff'
  }
};

export default PlayerCard;
