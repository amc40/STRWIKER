import { Team as TeamEnum } from '@prisma/client';
import PlayerCard from '../player-card/PlayerCard';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TeamHeader } from './TeamHeader';
import { useContext } from 'react';
import { sortArrayByPropertyAsc } from '@/app/utils/arrayUtils';
import { GameStateContext } from '@/app/context/GameStateContext';
import AddPlayerToTeam from '../AddPlayerToTeam';

interface TeamProps {
  team: TeamEnum;
  openSettingsModal: () => void;
}

export const Team: React.FC<TeamProps> = ({ team, openSettingsModal }) => {
  const gameState = useContext(GameStateContext);

  if (gameState == null) {
    throw new Error('Must be used in GameStateContext');
  }

  const {
    players: allPlayers,
    redScore,
    blueScore,
    redRotatyStrategy,
    blueRotatyStrategy,
    reorderPlayer,
    addPlayer,
  } = gameState;

  const members = sortArrayByPropertyAsc(
    allPlayers.filter((player) => player.team === team),
    ({ position }) => position,
  );

  const rotatyStrategy =
    team === TeamEnum.Red ? redRotatyStrategy : blueRotatyStrategy;
  const score = team === TeamEnum.Red ? redScore : blueScore;

  return (
    <div
      className={`flex flex-col flex-1 p-3 border border-slate-300 md:p-5 text-white 
      ${team === TeamEnum.Red ? 'bg-team-red' : 'bg-team-blue'}`}
    >
      <TeamHeader
        team={team}
        rotatyStrategy={rotatyStrategy}
        score={score}
        openSettingsModal={openSettingsModal}
      />
      <div className="h-full overflow-y-auto player-scrollbar">
        <DragDropContext
          onDragEnd={(onDragEndResponder) => {
            const destinationIndex = onDragEndResponder.destination?.index;
            if (destinationIndex == null) return;
            const playerId = Number.parseInt(onDragEndResponder.draggableId);
            const playerInfo = members.find((member) => member.id === playerId);
            if (!playerInfo)
              throw new Error(
                `There is no team member with id: ${playerId.toFixed()}`,
              );
            reorderPlayer(playerInfo, destinationIndex);
          }}
        >
          <Droppable droppableId={`${team}-players`}>
            {(provided) => (
              <ul
                className={`${team}-players inline-block`}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {members.map((member, index) => (
                  <Draggable
                    key={member.id}
                    draggableId={member.id.toFixed()}
                    index={index}
                  >
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <PlayerCard player={member} />
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
        <AddPlayerToTeam
          team={team}
          addPlayer={addPlayer}
          existingPlayers={allPlayers}
        />
      </div>
    </div>
  );
};
