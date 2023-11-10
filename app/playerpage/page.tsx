'use client';

import { Card, Metric, Text, Title, BarList, Flex, Grid } from '@tremor/react';
import Chart from './chart';
import {TeamMember, Team} from '../components/team'


  const teamBlueMembers: TeamMember[] = [
    { id: 1, name: 'Blue Player 1', photo: '../images/Image.png' },
    { id: 2, name: 'Blue Player 2', photo: '../images/Player.png' },
    { id: 3, name: 'Blue Player 3', photo: '../images/Player.png' }
  ];

  const teamRedMembers: TeamMember[] = [
    { id: 4, name: 'Red Player 1', photo: '../images/Player.png' },
    { id: 5, name: 'Red Player 2', photo: '../images/Player.png' }
  ];

export default function PlayerPage() {
  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div style={{ display: 'flex', height: '100vh' }}>
        <Team teamName="Team Blue" members={teamBlueMembers} />
        <Team teamName="Team Red" members={teamRedMembers} />
      </div>
    </main>
  );
}
