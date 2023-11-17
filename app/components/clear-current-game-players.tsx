import { FC } from 'react';

interface ClearCurrentGamePlayersProps {
  clearPlayers: () => void;
}

export const ClearCurrentGamePlayers: FC<ClearCurrentGamePlayersProps> = ({clearPlayers}) => {
  return (
    <button
    className={"btn"}
      onClick={async () => {
        clearPlayers();
      }}
    >
      Clear players
    </button>
  );
};
