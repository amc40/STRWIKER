import React from 'react';

export const SpectatorBadge: React.FC = () => (
  <div className="inline-flex items-center gap-1 ml-3 -mt-0.5 text-sm" title="Spectator in Play">
    <span>🏳️</span>
    <span className="text-gray-600 font-medium">Spectator in Play</span>
  </div>
);
