'use client';
import React, { createContext, useState, useContext, useRef } from 'react';

const CLEAR_MESSAGE_AFTER_MS: Record<MessageType, number> = {
  error: 3000,
};

interface MessageContext {
  readonly messages: Message[];
  readonly addErrorMessage: (errorMessage: string, error: unknown) => void;
}

export const MessageContext = createContext<MessageContext>({
  messages: [],
  addErrorMessage: (errorMessage) => {
    console.error('Default Message Handler Received error:', errorMessage);
  },
});

type MessageType = 'error';

interface Message {
  id: number;
  type: MessageType;
  text: string;
}

export const MessageProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messageIdRef = useRef(0);

  const addErrorMessage = (errorMessage: string, error: unknown) => {
    console.error(errorMessage, error);
    const id = messageIdRef.current++;
    setMessages((prevMessages) => [
      ...prevMessages,
      { id, type: 'error', text: errorMessage },
    ]);

    setTimeout(() => {
      setMessages((prevMessages) =>
        prevMessages.filter((message) => message.id !== id),
      );
    }, CLEAR_MESSAGE_AFTER_MS.error);
  };

  return (
    <MessageContext.Provider value={{ messages, addErrorMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  return useContext(MessageContext);
};
