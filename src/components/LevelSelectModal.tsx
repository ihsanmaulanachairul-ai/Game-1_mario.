import React from 'react';
import { X, Lock, CheckCircle2, Skull, Sparkles, Mountain, Compass } from 'lucide-react';
import { LEVEL_DEFINITIONS } from '../game/levels/levelConfigs';
import { SaveData } from '../game/types';

interface LevelSelectModalProps {
  saveData: SaveData;
  onSelectLevel: (levelNumber: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  saveData,
  onSelectLevel,
  onClose,
}) => {
  const unlocked = saveData.unlockedLevel || 1;
  const highestCleared = saveData.highestLevelCompleted || 0;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none overflow-y-auto animate-in fade-in duration-150">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-slate-100 shadow-2xl relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-400" />
              <h2 className="font-pixel text-lg sm:text-xl text-sky-400">
                SELECT STAGE
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose an unlocked trail ({highestCleared}/10 Stages Cleared)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 10 Level Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {LEVEL_DEFINITIONS.map((lvl) => {
            const isUnlocked = lvl.number <= unlocked;
            const isCleared = lvl.number <= highestCleared;
            const isBoss = lvl.number === 10;

            return (
              <button
                key={lvl.number}
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) onSelectLevel(lvl.number);
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  !isUnlocked
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-50 cursor-not-allowed'
                    : isBoss
                    ? 'bg-gradient-to-r from-rose-950/60 to-purple-950/60 border-rose-500/70 hover:border-rose-400 shadow-md shadow-rose-950/40'
                    : isCleared
                    ? 'bg-slate-950/80 border-emerald-600/60 hover:border-emerald-400 hover:bg-slate-900'
                    : 'bg-slate-950/80 border-sky-600/60 hover:border-sky-400 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Badge number */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-pixel text-xs font-bold border shrink-0 ${
                      !isUnlocked
                        ? 'bg-slate-900 border-slate-800 text-slate-500'
                        : isBoss
                        ? 'bg-rose-900/80 border-rose-500 text-rose-200'
                        : isCleared
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-sky-950 border-sky-500 text-sky-300'
                    }`}
                  >
                    {isBoss ? <Skull className="w-4 h-4 text-rose-300" /> : lvl.number}
                  </div>

                  {/* Title & Theme */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {lvl.title}
                      </span>
                      {isBoss && (
                        <span className="px-1.5 py-0.2 text-[9px] font-pixel bg-rose-950 text-rose-300 border border-rose-600 rounded">
                          BOSS
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">
                      {lvl.worldName.split('·')[1]?.trim() || lvl.worldName}
                    </span>
                  </div>
                </div>

                {/* Status Icon */}
                <div className="ml-2 shrink-0">
                  {!isUnlocked ? (
                    <Lock className="w-4 h-4 text-slate-600" />
                  ) : isCleared ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="font-pixel text-[10px] text-sky-400">PLAY</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Clear stages in order to face the Crystal Colossus!</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};
