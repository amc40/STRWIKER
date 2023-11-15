import { $Enums } from '@prisma/client';
import AddPlayerToTeam from './add-player-to-team';
import PlayerCard from './playercard';

export interface TeamMember {
  id: number;
  name: string;
}

interface TeamProps {
  team: $Enums.Team;
  members: TeamMember[];
  score: number;
  children?: JSX.Element;
}

export const Team: React.FC<TeamProps> = ({ team, members, score, children }) => (
  <div
    style={{
      flex: 1,
      padding: '20px',
      border: '1px solid #ccc',
      backgroundColor: team === $Enums.Team.Red ? '#EE2E31' : '#004f98',
      color: 'white'
    }}
  >
    <h2 className={"flex"}>
      Team {team} <span className={"flex-grow text-right text-5xl"}>{score}</span>
    </h2>
    <ul>
      {members.map((member) => (
        <PlayerCard key={member.id} playerName={member.name} />
      ))}
    </ul>
    {children}
  </div>
);
