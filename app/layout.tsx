import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import Nav from './nav';
import { Suspense } from 'react';
import React from 'react';
import { MessageProvider } from './context/MessageContext';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: 'STRWIKER',
  description:
    'Soft table recording wire for interactive kicking equipment for recreation',
};

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en">
      <body className="h-dvh flex flex-col">
        <Suspense>
          <Nav />
        </Suspense>
        <MessageProvider>{children}</MessageProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
