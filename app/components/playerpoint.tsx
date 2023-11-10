import React, { useState } from 'react';
import {Player, PlayerPoint} from "@prisma/client"

interface PlayerPointProps {
  playerPoint: PlayerPoint & {player: Player}
}

export const PlayerPointComponent = (playerPointProps : PlayerPointProps) => {
  const {playerPoint} = playerPointProps;
  const handleGoalClick = () => {

  };

  const handleOwnGoalClick = () => {

  };

  return (
    <div style={styles.card}>
      <h3 style={styles.playerName}>{playerPoint.player.name}</h3>
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

export default PlayerPoint;
