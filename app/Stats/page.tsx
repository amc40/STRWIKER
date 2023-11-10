export default function Stats() {
  return (
    <>
      <PlayerCard name={'john'} gamesPlayed={100} />
      <PlayerCard name={'alan'} gamesPlayed={100} />
    </>
  );
}

const PlayerCard = ({
  name,
  gamesPlayed
}: {
  name: string;
  gamesPlayed: number;
}) => {
  return (
    <>
      <div
        data-tilt
        data-tilt-glare
        data-tilt-max-glare="0.8"
        className="p-5 bg-red-600 w-[150px] h-[200px] border-blue-500 border mb-5 "
      >
        <p>{name}</p>
        <p>{gamesPlayed}</p>
      </div>
    </>
  );
};
