import PlayerCard from "./playercard";

export interface TeamMember {
  id: number;
  name: string;
}

interface TeamProps {
  teamName: string;
  members: TeamMember[];
}

export const Team: React.FC<TeamProps> = ({ teamName, members }) => (
  <div
    style={{
      flex: 1,
      padding: '20px',
      border: '1px solid #ccc',
      backgroundColor: teamName === 'Team Red' ? '#EE2E31' : '#004f98',
      color: 'white'
    }}
  >
    <h2>{teamName}</h2>
    <ul>
      {members.map((member) => (
        <PlayerCard key={member.id} playerName={member.name} />
      ))}
    </ul>
  </div>
);
