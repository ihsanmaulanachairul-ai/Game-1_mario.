import React from 'react';
import { Play, RotateCcw, HelpCircle, Settings, Trophy, Sparkles, Compass } from 'lucide-react';
import { SaveData } from '../game/types';
import { getLevelConfig } from '../game/levels/levelConfigs';

interface MainMenuProps {
  saveData: SaveData;
  onPlayNow: () => void;
  onContinue: () => void;
  onOpenLevelSelect: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  saveData,
  onPlayNow,
  onContinue,
  onOpenLevelSelect,
  onOpenHowToPlay,
  onOpenSettings,
}) => {
  const unlocked = saveData.unlockedLevel || 1;
  const currentLvlConfig = getLevelConfig(unlocked);
  const hasProgress = saveData.highScore > 0 || (saveData.highestLevelCompleted && saveData.highestLevelCompleted > 0);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-radial from-slate-900 via-slate-950 to-black select-none overflow-y-auto">
      {/* Decorative Pixel Stars / Meadow Vibes */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-md w-full flex flex-col items-center text-center">
        {/* Animated Badge & Pip Avatar */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-700/60 text-sky-300 text-xs font-semibold mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>10 Stages · Ancient Crystal Sanctum</span>
        </div>

        {/* Game Title */}
        <h1 className="font-pixel text-3xl sm:text-4xl text-amber-300 drop-shadow-[0_4px_12px_rgba(245,158,11,0.3)] tracking-tight mb-1">
          TINY TRAILS
        </h1>
        <h2 className="font-pixel text-xl sm:text-2xl text-sky-400 drop-shadow-[0_2px_8px_rgba(56,189,248,0.4)] tracking-wide mb-5">
          CRYSTAL RUN
        </h2>

        {/* High Score & Progression Tag */}
        <div className="flex items-center gap-2 mb-5 px-4 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>BEST SCORE:</span>
          <span className="font-pixel text-amber-300 tabular-nums font-bold">
            {saveData.highScore.toString().padStart(6, '0')}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-pixel text-[10px]">
            {saveData.highestLevelCompleted || 0}/10 CLEARED
          </span>
        </div>

        {/* Pip The Explorer Character Card */}
        <div className="flex items-center gap-3 p-3 mb-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl w-full">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-900 to-emerald-950 border border-sky-500/40 flex items-center justify-center shrink-0">
            {/* Pip Pixel Icon */}
            <div className="relative w-8 h-8 flex flex-col items-center justify-center">
              <div className="w-4 h-2 bg-emerald-800 rounded-t-sm" />
              <div className="w-5 h-3 bg-amber-200 border-x border-amber-800 flex justify-around items-center px-0.5">
                <div className="w-1 h-1 bg-slate-900 rounded-full" />
                <div className="w-1 h-1 bg-slate-900 rounded-full" />
              </div>
              <div className="w-6 h-1.5 bg-sky-400 rounded-sm shadow-sm" />
              <div className="w-4 h-2 bg-emerald-700" />
            </div>
          </div>
          <div className="text-left min-w-0">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>Pip the Explorer</span>
            </h3>
            <p className="text-xs text-slate-400 truncate">
              Ready for Level {unlocked}: {currentLvlConfig.title}
            </p>
          </div>
        </div>

        {/* Primary Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onPlayNow}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.98] text-white font-bold font-pixel text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>PLAY NOW</span>
          </button>

          {hasProgress && (
            <button
              type="button"
              onClick={onContinue}
              className="w-full py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] border border-slate-700 text-slate-200 font-bold font-pixel text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-sky-400" />
              <span>CONTINUE (STAGE {unlocked})</span>
            </button>
          )}

          {/* Level Select Button */}
          <button
            type="button"
            onClick={onOpenLevelSelect}
            className="w-full py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] border border-slate-700/80 text-sky-300 font-bold font-pixel text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span>SELECT STAGE (1-10)</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5 mt-0.5">
            <button
              type="button"
              onClick={onOpenHowToPlay}
              className="py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span>How To Play</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Platform info footer */}
        <p className="mt-6 text-[11px] text-slate-500">
          World 1: Mossy Meadow · World 2: Crystal Caverns · Level 10: Crystal Colossus
        </p>
      </div>
    </div>
  );
};
