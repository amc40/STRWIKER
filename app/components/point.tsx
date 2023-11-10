import { Player, Point, PlayerPoint } from '@prisma/client';
import { Team } from '../components/team';
import React, { useEffect, useState } from 'react';

interface IPointProps {
  point: Point & { playerPoints: (PlayerPoint & { player: Player })[] };
}

export const PointComponent = async (pointProps: IPointProps) => {
  'use client';

  const point = pointProps.point;
  const bluePlayerPoints = point.playerPoints.filter(
    (playerPoint) => playerPoint.team == 'Blue'
  );
  const redPlayerPoints = point.playerPoints.filter(
    (playerPoint) => playerPoint.team == 'Red'
  );

  return (
    <div style={{ display: 'flex' }}>
      <Team team="blue" playerPoints={bluePlayerPoints} />
      <Team team="red" playerPoints={redPlayerPoints} />
    </div>
  );
};
