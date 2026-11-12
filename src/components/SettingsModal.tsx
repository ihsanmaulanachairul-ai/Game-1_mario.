import React, { useState } from 'react';
import { X, Volume2, Music, Trash2, Check } from 'lucide-react';
import { SaveData } from '../game/types';
import { soundManager } from '../game/audio/SoundManager';
import { resetGameData } from '../utils/storage';

interface SettingsModalProps {
  saveData: SaveData;
  onUpdateSaveData: (data: Partial<SaveData>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  saveData,
  onUpdateSaveData,
  onClose,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const handleToggleSound = () => {
    const next = !saveData.soundEnabled;
    soundManager.setSoundEnabled(next);
    onUpdateSaveData({ soundEnabled: next });
    if (next) soundManager.playCrystal();
  };

  const handleToggleMusic = () => {
    const next = !saveData.musicEnabled;
    soundManager.setMusicEnabled(next);
    onUpdateSaveData({ musicEnabled: next });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    soundManager.setVolume(vol);
    onUpdateSaveData({ volume: vol });
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    const reset = resetGameData();
    onUpdateSaveData(reset);
    setConfirmReset(false);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="max-w-xs w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-200 shadow-2xl relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="font-pixel text-lg text-amber-400 mb-1">SETTINGS</h2>
        <p className="text-xs text-slate-400 mb-5">Audio and Game Data</p>

        <div className="flex flex-col gap-4 mb-6">
          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-semibold">Sound Effects</span>
            </div>
            <button
              type="button"
              onClick={handleToggleSound}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                saveData.soundEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
              }`}
              aria-label="Toggle Sound Effects"
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Music className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold">Chiptune Melody</span>
            </div>
            <button
              type="button"
              onClick={handleToggleMusic}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                saveData.musicEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
              }`}
              aria-label="Toggle Background Music"
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Master Volume</span>
              <span className="font-pixel text-amber-300 text-[10px]">
                {Math.round(saveData.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={saveData.volume}
              onChange={handleVolumeChange}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Reset Save Data */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer ${
                confirmReset
                  ? 'bg-red-950 border-red-600 text-red-300 hover:bg-red-900'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-900/50'
              }`}
            >
              {confirmReset ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Click Again to Confirm Reset</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Saved Progress</span>
                </>
              )}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
