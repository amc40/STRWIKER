import { NormalizeError } from 'next/dist/shared/lib/utils';
import React from 'react';
import { getEnvironmentData } from 'worker_threads';
import Image from 'next/image';
import prisma from '../../lib/planetscale';

interface Player {
  name: string;
  rarity: number;
  gamesPlayed: number;
  wins: number;
}

const mockPlayerData: Player[] = [
  { name: 'john', rarity: 0, gamesPlayed: 10, wins: 5 },
  { name: 'jordan', rarity: 0, gamesPlayed: 20, wins: 3 },
  { name: 'ted', rarity: 0, gamesPlayed: 8, wins: 5 },
  { name: 'alan', rarity: 1, gamesPlayed: 10, wins: 5 },
  { name: 'joey', rarity: 0, gamesPlayed: 10, wins: 5 },
  { name: 'emma', rarity: 1, gamesPlayed: 15, wins: 9 }
];

const getData = async (): Promise<Player[]> => {
  const response = await fetch(
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000') + '/api/players',
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  const dbData = (await response.json()) as Player[];
  return dbData.map((player) => ({
    name: player.name ?? 'NONE',
    rarity: 0,
    gamesPlayed: 99,
    wins: 5
  }));
};

export default async function Stats() {
  const data = await getData();

  return (
    <>
      <h1 className={'text-2xl text-center'}>Player Stats</h1>
      <CardContainer>
        {data.map((sticker, index) => (
          <PlayerCard
            name={sticker.name}
            gamesPlayed={sticker.gamesPlayed}
            rarity={sticker.rarity}
            key={index}
          />
        ))}
      </CardContainer>
    </>
  );
}

enum Rarity {
  NORMAL,
  HOLOGRAPHIC
}

const PlayerCard = ({
  name,
  gamesPlayed,
  rarity
}: {
  name: string;
  gamesPlayed: number;
  rarity: Rarity;
}) => {
  return (
    <>
      <div
        data-tilt
        data-tilt-glare
        data-tilt-max-glare="0.8"
        data-tilt-scale="1.1"
        className={`p-2 rounded-md w-[150px] h-[200px] border-blue-500 border-2 mb-5 
        ${rarity === Rarity.HOLOGRAPHIC ? 'bg-yellow-400' : 'bg-slate-300'}`}
      >
        <div
          className={
            'bg-slate-50 rounded-md w-full h-[100px] flex justify-center'
          }
        >
          <Image
            src="/images/Player.png"
            alt="avatar"
            width={100}
            height={100}
          />
        </div>
        <p className={'uppercase text-center'}>{name}</p>
        <div className={'border-b border-blue-500 mb-1'}></div>
        <div className={'flex flex-row flex-wrap justify-evenly'}>
          <div className={'flex flex-wrap'}>
            <StatsColumn>
              <p>
                <span className={'font-bold pr-1'}>{gamesPlayed}</span>ONE
              </p>
              <p>
                <span className={'font-bold pr-1'}>{gamesPlayed}</span>TWO
              </p>
            </StatsColumn>
          </div>
          <div className={'border-r border-blue-500'}></div>
          <div className={'flex flex-wrap'}>
            <StatsColumn>
              <p>
                <span className={'font-bold pr-1'}>{gamesPlayed}</span>THR
              </p>
              <p>
                <span className={'font-bold pr-1'}>6</span>FOU
              </p>
            </StatsColumn>
          </div>
        </div>
      </div>
    </>
  );
};

const StatsColumn = ({ children }: { children: React.ReactNode }) => {
  return <div className={'flex-wrap'}>{children}</div>;
};

const CardContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="p-5 flex flex-wrap gap-5">{children}</div>;
};
