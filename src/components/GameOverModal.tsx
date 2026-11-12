import React from 'react';
import { Skull, RotateCcw, Home, Sparkles } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  crystals: number;
  onRetry: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  crystals,
  onRetry,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="max-w-xs w-full bg-slate-900 border-2 border-red-500/50 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center">
        {/* Skull Icon */}
        <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-600/50 flex items-center justify-center mb-3">
          <Skull className="w-8 h-8 text-red-400" />
        </div>

        <h2 className="font-pixel text-xl sm:text-2xl text-red-400 mb-1">
          GAME OVER
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          Pip fainted in Greenfield Crossing!
        </p>

        {/* Score & Crystals */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Score Reached</span>
            <span className="font-pixel text-amber-300 tabular-nums">
              {score.toString().padStart(6, '0')}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Crystals</span>
            </span>
            <span className="font-pixel text-sky-300 tabular-nums">
              {crystals.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onRetry}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-pixel text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TRY AGAIN</span>
          </button>

          <button
            type="button"
            onClick={onMainMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs font-medium flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
