import React from 'react';
import { Trophy, RotateCcw, Home, Sparkles, Clock, ArrowRight, Compass, Crown } from 'lucide-react';
import { getLevelConfig } from '../game/levels/levelConfigs';

interface VictoryModalProps {
  stats: {
    levelNumber: number;
    score: number;
    crystals: number;
    timeBonus: number;
    totalScore: number;
    isNewHighScore: boolean;
    isGameComplete: boolean;
  };
  onNextLevel: () => void;
  onLevelSelect: () => void;
  onReplay: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  onNextLevel,
  onLevelSelect,
  onReplay,
  onMainMenu,
}) => {
  const config = getLevelConfig(stats.levelNumber);
  const isFinalBoss = stats.levelNumber === 10 || stats.isGameComplete;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in zoom-in-95 duration-200">
      <div className={`max-w-sm w-full bg-slate-900 border-2 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center ${
        isFinalBoss
          ? 'border-amber-400 shadow-amber-500/20 bg-gradient-to-b from-slate-900 via-purple-950/40 to-slate-950'
          : 'border-amber-500/60 shadow-amber-950/50'
      }`}>
        {/* Victory Icon */}
        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-3 ${
          isFinalBoss
            ? 'bg-amber-400/20 border-amber-300'
            : 'bg-amber-500/20 border-amber-400/50'
        }`}>
          {isFinalBoss ? (
            <Crown className="w-8 h-8 text-amber-300 animate-bounce" />
          ) : (
            <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
          )}
        </div>

        <h2 className="font-pixel text-xl sm:text-2xl text-amber-300 mb-0.5">
          {isFinalBoss ? 'MOSS SANCTUM SAVED!' : 'STAGE CLEARED!'}
        </h2>
        <p className="text-xs text-sky-300 font-medium mb-3">
          Level {stats.levelNumber} · {config.title}
        </p>

        {isFinalBoss && (
          <div className="w-full py-1.5 px-3 rounded-xl bg-purple-950/80 border border-purple-500 text-purple-200 text-xs font-pixel mb-3 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>ALL 10 STAGES CONQUERED!</span>
          </div>
        )}

        {stats.isNewHighScore && (
          <div className="w-full py-1.5 px-3 rounded-lg bg-emerald-950/80 border border-emerald-600/80 text-emerald-300 text-xs font-pixel mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>NEW BEST RECORD!</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-5 flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Base Score</span>
            <span className="font-pixel text-slate-200 tabular-nums">
              {stats.score.toString().padStart(6, '0')}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>Crystals ({stats.crystals} x 50)</span>
            </span>
            <span className="font-pixel text-sky-300 tabular-nums">
              +{(stats.crystals * 50).toString().padStart(4, '0')}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Time Bonus</span>
            </span>
            <span className="font-pixel text-emerald-300 tabular-nums">
              +{stats.timeBonus.toString().padStart(4, '0')}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="font-bold text-slate-100">TOTAL SCORE</span>
            <span className="font-pixel text-base text-amber-300 tabular-nums font-bold">
              {stats.totalScore.toString().padStart(6, '0')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2">
          {!isFinalBoss && stats.levelNumber < 10 && (
            <button
              type="button"
              onClick={onNextLevel}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white font-pixel text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              <span>NEXT STAGE (LEVEL {stats.levelNumber + 1})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onReplay}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Replay</span>
            </button>

            <button
              type="button"
              onClick={onLevelSelect}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Stages</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onMainMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-950/80 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-2 border border-slate-800 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
