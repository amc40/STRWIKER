import { $Enums, RotatyStrategy } from '@prisma/client';
import PlayerCard from '../player-card/PlayerCard';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PlayerInfo } from '../../view/PlayerInfo';
import { TeamHeader } from './TeamHeader';
import { PropsWithChildren } from 'react';

interface TeamProps {
  team: $Enums.Team;
  members: PlayerInfo[];
  rotatyStrategy: RotatyStrategy;
  score: number;
  removePlayer: (player: PlayerInfo) => void;
  reorderPlayer: (player: PlayerInfo, destinationIndex: number) => void;
  openSettingsModal: () => void;
}

export const Team: React.FC<PropsWithChildren<TeamProps>> = ({
  team,
  members,
  rotatyStrategy,
  score,
  removePlayer,
  reorderPlayer,
  openSettingsModal,
  children,
}) => {
  return (
    <div
      className={`flex flex-col flex-1 p-3 border border-slate-300 md:p-5 text-white 
      ${team === $Enums.Team.Red ? 'bg-team-red' : 'bg-team-blue'}`}
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
              throw new Error(`There is no team member with id: ${playerId}`);
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
                    draggableId={`${member.id}`}
                    index={index}
                  >
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <PlayerCard
                          player={member}
                          removePlayer={removePlayer}
                        />
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
        {children}
      </div>
    </div>
  );
};
