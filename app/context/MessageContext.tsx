'use client';
import React, { createContext, useState, useContext, useRef } from 'react';

const CLEAR_MESSAGE_AFTER_MS: Record<MessageType, number> = {
  error: 30000,
};

interface MessageContext {
  readonly messages: Message[];
  readonly addErrorMessage: (errorMessage: string) => void;
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

  const addErrorMessage = (errorMessage: string) => {
    console.error(errorMessage);
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
