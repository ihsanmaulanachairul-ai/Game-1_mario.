import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface PauseMenuProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  soundEnabled,
  onToggleSound,
  onResume,
  onRestart,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="max-w-xs w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl flex flex-col items-center">
        <h2 className="font-pixel text-xl text-sky-400 mb-1">GAME PAUSED</h2>
        <p className="text-xs text-slate-400 mb-6">Greenfield Crossing · Level 1-1</p>

        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-pixel text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>RESUME</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-pixel text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>RESTART LEVEL</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs font-medium flex items-center justify-center gap-2 border border-slate-700/80 transition cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Audio: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-red-400" />
                <span>Audio: OFF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onMainMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-2 border border-slate-800 transition cursor-pointer mt-1"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
