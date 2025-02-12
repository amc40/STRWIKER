'use client';
import React from 'react';
import { useMessage } from '../../context/MessageContext';
import { ErrorIcon } from '../icons/ErrorIcon';

export const Messages: React.FC = () => {
  const { messages } = useMessage();

  return (
    <div className="flex justify-center">
      <div className="justify-center fixed bottom-5 w-4/5 flex flex-col items-center space-y-2 z-50 transition-opacity duration-500">
        {messages.map((message) => (
          <span
            key={`message-${message.id.toFixed()}`}
            className={`flex gap-2 py-1 px-2 rounded-md text-center border border-black bg-white shadow-md`}
          >
            <div className="flex w-14 md:w-6">
              {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
              {message.type === 'error' ? <ErrorIcon /> : null}
            </div>

            <p>{message.text}</p>
          </span>
        ))}
      </div>
    </div>
  );
};
