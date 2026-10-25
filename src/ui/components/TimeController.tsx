import React, { useState, useEffect } from 'react';
import { WaxSealButton } from './WaxSealButton';
import { Play, Pause, ChevronRight } from 'lucide-react';

interface TimeControllerProps {
  onAdvanceMonth: () => void;
  disabled?: boolean;
}

export const TimeController: React.FC<TimeControllerProps> = ({
  onAdvanceMonth,
  disabled = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);

  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.max(300, 2000 / speedMultiplier);
    const timer = setInterval(() => {
      onAdvanceMonth();
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, speedMultiplier, onAdvanceMonth]);

  return (
    <div className="flex items-center gap-2 bg-parchment-100 p-1.5 rounded-lg border border-parchment-border shadow-sm">
      {/* Primary Pass Month Button */}
      <WaxSealButton
        variant="seal"
        size="md"
        onClick={() => onAdvanceMonth()}
        disabled={disabled || isPlaying}
        icon={<ChevronRight className="w-4 h-4" />}
      >
        Passer le mois
      </WaxSealButton>

      {/* Auto Play / Pause Toggle */}
      <button
        type="button"
        onClick={() => setIsPlaying(!isPlaying)}
        className={`p-2 rounded border transition-all ${
          isPlaying
            ? 'bg-amber-100 border-amber-400 text-amber-800'
            : 'bg-parchment-200 border-parchment-border hover:bg-parchment-300 text-iron-grey-800'
        }`}
        title={isPlaying ? 'Mettre en pause' : 'Défilement automatique du temps'}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      {/* Speed Controls */}
      <div className="flex items-center bg-parchment-200 rounded border border-parchment-border overflow-hidden text-xs font-serif font-bold">
        {[1, 5, 10].map(speed => (
          <button
            key={speed}
            type="button"
            onClick={() => setSpeedMultiplier(speed)}
            className={`px-2 py-1.5 transition-colors ${
              speedMultiplier === speed
                ? 'bg-royal-gold-500 text-iron-grey-900'
                : 'text-iron-grey-700 hover:bg-parchment-300'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
};
