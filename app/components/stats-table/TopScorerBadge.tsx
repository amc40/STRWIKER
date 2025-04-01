import React from 'react';

export const TopScorerBadge: React.FC = () => (
  <div className="inline-flex items-center ml-2" title="Top Scorer">
    <div className="relative">
      {/* Shield shape */}
      <div className="w-5 h-6 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-t-lg relative">
        {/* Bottom points of shield */}
        <div className="absolute bottom-0 left-0 w-1/2 h-2 bg-gradient-to-b from-yellow-500 to-yellow-600" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%, 0 0)' }} />
        <div className="absolute bottom-0 right-0 w-1/2 h-2 bg-gradient-to-b from-yellow-500 to-yellow-600" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 50% 100%)' }} />
        
        {/* Crown on top */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-2 bg-yellow-300 relative">
            <div className="absolute top-0 left-0 w-1 h-1.5 bg-yellow-300" style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }} />
            <div className="absolute top-0 left-1 w-1 h-1.5 bg-yellow-300" style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }} />
            <div className="absolute top-0 left-2 w-1 h-1.5 bg-yellow-300" style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }} />
          </div>
        </div>

        {/* Star in center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-200 text-xs">
          ★
        </div>
      </div>
    </div>
  </div>
);
