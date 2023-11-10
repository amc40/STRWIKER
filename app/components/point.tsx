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
    (playerPoint) => playerPoint.team == 'blue'
  );
  const redPlayerPoints = point.playerPoints.filter(
    (playerPoint) => playerPoint.team == 'red'
  );

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div style={{ display: 'flex', height: '100vh' }}>
        <Team team="blue" playerPoints={bluePlayerPoints} />
        <Team team="red" playerPoints={redPlayerPoints} />
      </div>
    </main>
  );
};
