import { SaveData } from '../game/types';

const STORAGE_KEY = 'tinytrails_crystal_run_save_v1';

const DEFAULT_SAVE_DATA: SaveData = {
  highScore: 0,
  totalCrystals: 0,
  levelCompleted: false,
  soundEnabled: true,
  musicEnabled: true,
  volume: 0.7,
  selectedSkin: 'default',
  lastPlayedDate: undefined,
};

export function loadSaveData(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SAVE_DATA };
    const parsed = JSON.parse(raw);
    return {
      highScore: typeof parsed.highScore === 'number' && !isNaN(parsed.highScore) ? Math.max(0, parsed.highScore) : 0,
      totalCrystals: typeof parsed.totalCrystals === 'number' && !isNaN(parsed.totalCrystals) ? Math.max(0, parsed.totalCrystals) : 0,
      levelCompleted: Boolean(parsed.levelCompleted),
      soundEnabled: parsed.soundEnabled !== false,
      musicEnabled: parsed.musicEnabled !== false,
      volume: typeof parsed.volume === 'number' && !isNaN(parsed.volume) ? Math.min(1, Math.max(0, parsed.volume)) : 0.7,
      selectedSkin: parsed.selectedSkin || 'default',
      lastPlayedDate: parsed.lastPlayedDate || new Date().toISOString(),
    };
  } catch (err) {
    console.warn('Failed to parse save data from LocalStorage, using defaults:', err);
    return { ...DEFAULT_SAVE_DATA };
  }
}

export function saveGameData(partial: Partial<SaveData>): SaveData {
  try {
    const current = loadSaveData();
    const updated: SaveData = {
      ...current,
      ...partial,
      lastPlayedDate: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to write save data to LocalStorage:', err);
    return { ...DEFAULT_SAVE_DATA, ...partial };
  }
}

export function resetGameData(): SaveData {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear LocalStorage:', err);
  }
  return { ...DEFAULT_SAVE_DATA };
}
