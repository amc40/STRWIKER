import { Player, PlayerPoint } from '@prisma/client';
import { PlayerPointComponent } from './playerpoint';

export interface TeamMember {
  id: number;
  name: string;
}

interface TeamProps {
  team: string;
  playerPoints: (PlayerPoint & { player: Player })[];
}

export const Team: React.FC<TeamProps> = (teamProps: TeamProps) => {
  const { team, playerPoints } = teamProps;
  return (
    <div
      style={{
        width: '50%',
        padding: '20px',
        border: '1px solid #ccc',
        backgroundColor: team == 'red' ? '#EE2E31' : '#004f98',
        color: 'white'
      }}
    >
      <ul>
        {playerPoints.map((playerPoint) => (
          <PlayerPointComponent
            key={playerPoint.id}
            playerPoint={playerPoint}
          />
        ))}
      </ul>
    </div>
  );
};
