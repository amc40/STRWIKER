import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import Nav from './nav';
import { Suspense } from 'react';
import Script from 'next/script';
import React from 'react';
import { MessageProvider } from './context/MessageContext';
import { Messages } from './components/message/Messages';

export const metadata = {
  title: 'STRWIKER',
  description:
    'Soft table recording wire for interactive kicking equipment for recreation',
};

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en">
      <body className="h-screen flex flex-col">
        <Suspense>
          <Nav />
        </Suspense>
        <MessageProvider>
          <Messages />
          {children}
        </MessageProvider>
        <Analytics />
        <Script type="module" src="vanilla-tilt.js" strategy="lazyOnload" />
      </body>
    </html>
  );
};

export default RootLayout;
