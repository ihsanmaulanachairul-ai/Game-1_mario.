import React from 'react';
import { Heart, Pause, Volume2, VolumeX, Sparkles, Skull } from 'lucide-react';
import { BossInfo } from '../game/types';
import { getLevelConfig } from '../game/levels/levelConfigs';

interface GameHudProps {
  levelNumber: number;
  score: number;
  crystals: number;
  health: number;
  maxHealth: number;
  lives: number;
  timeRemaining: number;
  bossInfo: BossInfo | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  levelNumber,
  score,
  crystals,
  health,
  maxHealth,
  lives,
  timeRemaining,
  bossInfo,
  soundEnabled,
  onToggleSound,
  onPause,
}) => {
  const config = getLevelConfig(levelNumber);
  const isBossLevel = levelNumber === 10;

  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex flex-col select-none pointer-events-none">
      <header className="pointer-events-auto flex items-center justify-between px-3 py-2 bg-slate-950/85 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
        {/* Zone 1: World & Level Title & Hearts/Lives */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex flex-col">
            <span className={`text-[10px] font-pixel tracking-wider uppercase ${isBossLevel ? 'text-rose-400 font-bold' : 'text-sky-400'}`}>
              {isBossLevel ? 'LEVEL 10 · BOSS' : `LEVEL ${levelNumber}`}
            </span>
            <span className="text-xs font-semibold text-slate-200 hidden sm:inline truncate max-w-[150px]">
              {config.title}
            </span>
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
        <div className="flex items-center gap-3 sm:gap-4">
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
            <span className="text-xs sm:text-sm font-pixel text-amber-300 tabular-nums font-bold">
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

      {/* Boss Health Bar (Rendered during Level 10 Boss Encounter) */}
      {isBossLevel && bossInfo && bossInfo.active && (
        <div className="pointer-events-auto flex justify-center w-full mt-2 px-4">
          <div className="max-w-md w-full bg-slate-950/90 border-2 border-rose-600/70 rounded-xl p-2.5 shadow-xl flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-pixel text-[11px] text-rose-300">
                <Skull className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>{bossInfo.name}</span>
              </span>
              <span className="font-pixel text-[10px] text-slate-400 tabular-nums">
                {bossInfo.health} / {bossInfo.maxHealth} HP
              </span>
            </div>

            {/* Segmented Boss HP Bar */}
            <div className="w-full h-3 bg-slate-900 rounded-full border border-slate-700 p-0.5 flex gap-1 overflow-hidden">
              {Array.from({ length: bossInfo.maxHealth }).map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 rounded-sm transition-all duration-200 ${
                    idx < bossInfo.health
                      ? 'bg-gradient-to-r from-rose-600 to-amber-500 shadow-sm shadow-rose-500/50'
                      : 'bg-slate-800/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
