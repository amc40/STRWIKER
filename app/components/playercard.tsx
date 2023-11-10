import React, { useState } from 'react';

const PlayerCard = ({ playerName }) => {
  const [goals, setGoals] = useState(0);
  const [ownGoals, setOwnGoals] = useState(0);

  const handleGoalClick = () => {
    setGoals(goals + 1);
  };

  const handleOwnGoalClick = () => {
    setOwnGoals(ownGoals + 1);
  };

  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '10px',
        margin: '10px',
        width: '200px'
      }}
    >
      <h3>{playerName}</h3>
      <p>Goals: {goals}</p>
      <p>Own Goals: {ownGoals}</p>
      <button onClick={handleGoalClick}>Goal</button>
      <button onClick={handleOwnGoalClick}>Own Goal</button>
    </div>
  );
};

export default PlayerCard;
