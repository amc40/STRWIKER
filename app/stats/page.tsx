'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getPlayers } from '../../lib/Player.actions';
import { Player } from '@prisma/client';
import { useMessage } from '../context/MessageContext';

const Stats: React.FC = () => {
  // TODO: pass in initial data from server
  const [players, setPlayers] = useState<Player[]>([]);

  const { addErrorMessage } = useMessage();

  useEffect(() => {
    const populatePlayers = async () => {
      const players = await getPlayers();
      setPlayers(players);
    };
    populatePlayers().catch((e) => {
      addErrorMessage(`Error populating players: ${e}`);
    });
  }, [addErrorMessage]);

  return (
    <>
      <h1 className={'text-2xl text-center'}>Player Stats</h1>
      <CardContainer>
        {players.map((player, index) => (
          <PlayerCard
            name={player.name}
            gamesPlayed={player.gamesPlayed}
            // TODO: this is dumb lol
            rarity={player.elo > 2000 ? Rarity.HOLOGRAPHIC : Rarity.NORMAL}
            key={index}
          />
        ))}
      </CardContainer>
    </>
  );
};

export default Stats;

enum Rarity {
  NORMAL,
  HOLOGRAPHIC,
}

const PlayerCard = ({
  name,
  gamesPlayed,
  rarity,
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
