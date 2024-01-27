import { $Enums } from '@prisma/client';
import PlayerCard from './playercard';
import { PlayerInfo, reorderPlayer } from '../../lib/Game.actions';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface TeamProps {
  team: $Enums.Team;
  members: PlayerInfo[];
  score: number;
  children?: JSX.Element;
  removePlayer: (player: PlayerInfo) => void;
  hideOnSmallScreen?: boolean;
}

export const Team: React.FC<TeamProps> = ({
  team,
  members,
  score,
  removePlayer,
  children,
  hideOnSmallScreen = false
}) => {
  return (
    <div
      className={hideOnSmallScreen ? 'hidden md:block' : ''}
      style={{
        flex: 1,
        padding: '20px',
        border: '1px solid #ccc',
        backgroundColor: team === $Enums.Team.Red ? '#EE2E31' : '#004f98',
        color: 'white'
      }}
    >
      <h2 className={'flex'}>
        Team {team}{' '}
        <span className={'flex-grow text-right text-5xl'}>{score}</span>
      </h2>
      <DragDropContext
        onDragEnd={async (onDragEndResponder) => {
          const destinationIndex = onDragEndResponder.destination?.index;
          if (destinationIndex == null) return;
          const playerId = Number.parseInt(onDragEndResponder.draggableId);
          await reorderPlayer(playerId, destinationIndex);
        }}
      >
        <Droppable droppableId={`${team}-players`}>
          {(provided) => (
            <ul
              className={`${team}-players`}
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
                      <PlayerCard player={member} removePlayer={removePlayer} />
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
  );
};
