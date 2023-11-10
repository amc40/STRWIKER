'use client';

import { TeamMember, Team } from '../components/team';

const teamBlueMembers: TeamMember[] = [
  { id: 1, name: 'Blue Player 1' },
  { id: 2, name: 'Blue Player 2' },
  { id: 3, name: 'Blue Player 3' }
];

const teamRedMembers: TeamMember[] = [
  { id: 4, name: 'Red Player 1' },
  { id: 5, name: 'Red Player 2' }
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
