import React, { useState } from 'react';

interface PlayerCardType {
  playerName: string;
}

const PlayerCard: React.FC<PlayerCardType> = ({ playerName }) => {
  const [goals, setGoals] = useState(0);
  const [ownGoals, setOwnGoals] = useState(0);
  const x: React.CSSProperties = { textAlign: 'center' };

  const handleGoalClick = () => {
    setGoals(goals + 1);
  };

  const handleOwnGoalClick = () => {
    setOwnGoals(ownGoals + 1);
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.playerName}>{playerName}</h3>
      <p style={styles.stat}>Goals: {goals}</p>
      <p style={styles.stat}>Own Goals: {ownGoals}</p>
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
    width: '200px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    textAlign: 'center',
    color: 'black'
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
