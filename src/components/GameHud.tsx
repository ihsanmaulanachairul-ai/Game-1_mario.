import React from 'react';
import { Heart, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface GameHudProps {
  score: number;
  crystals: number;
  health: number;
  maxHealth: number;
  lives: number;
  timeRemaining: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  score,
  crystals,
  health,
  maxHealth,
  lives,
  timeRemaining,
  soundEnabled,
  onToggleSound,
  onPause,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-2 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 text-slate-100 select-none">
      {/* Zone 1: World & Hearts/Lives */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-pixel text-sky-400 uppercase tracking-wider">WORLD 1-1</span>
          <span className="text-xs font-semibold text-slate-200 hidden sm:inline">Greenfield Crossing</span>
        </div>

        {/* Health Hearts */}
        <div className="flex items-center gap-1 pl-2 border-l border-slate-700/60" aria-label={`Health: ${health} of ${maxHealth}`}>
          {Array.from({ length: maxHealth }).map((_, i) => (
            <Heart
              key={i}
              className={`w-4 h-4 transition-colors ${
                i < health ? 'fill-red-500 text-red-500' : 'text-slate-600 fill-slate-800'
              }`}
            />
          ))}
          <span className="text-xs font-pixel text-slate-400 ml-1">x{lives}</span>
        </div>
      </div>

      {/* Zone 2: Crystals & Score */}
      <div className="flex items-center gap-4">
        {/* Crystals */}
        <div className="flex items-center gap-1.5 bg-sky-950/70 border border-sky-800/80 px-2 py-0.5 rounded-md">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs font-pixel text-sky-300 tabular-nums">
            {crystals.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-pixel text-slate-400 uppercase">SCORE</span>
          <span className="text-xs sm:text-sm font-pixel text-amber-300 tabular-nums">
            {score.toString().padStart(6, '0')}
          </span>
        </div>

        {/* Time */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[9px] font-pixel text-slate-400 uppercase">TIME</span>
          <span className="text-xs font-pixel text-emerald-300 tabular-nums">
            {timeRemaining.toString().padStart(3, '0')}
          </span>
        </div>
      </div>

      {/* Zone 3: Quick Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSound}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          aria-label={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
        </button>

        <button
          type="button"
          onClick={onPause}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          title="Pause Game (P / Esc)"
          aria-label="Pause Game"
        >
          <Pause className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-pixel text-[10px]">PAUSE</span>
        </button>
      </div>
    </header>
  );
};
