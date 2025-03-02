'use client';
import React, { createContext, useContext } from 'react';
import { toast } from 'sonner';

interface MessageContext {
  readonly addErrorMessage: (errorMessage: string, error: unknown) => void;
}

export const MessageContext = createContext<MessageContext>({
  addErrorMessage: (errorMessage) => {
    console.error('Default Message Handler Received error:', errorMessage);
  },
});

export const MessageProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const addErrorMessage = (errorMessage: string, error: unknown) => {
    console.error(errorMessage, error);
    toast.error(errorMessage);
  };

  return (
    <MessageContext.Provider value={{ addErrorMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  return useContext(MessageContext);
};
