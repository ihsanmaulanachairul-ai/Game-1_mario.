/**
 * Tiny Trails: Crystal Run - Core Type Definitions
 */

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpJustDown: boolean;
  sprint: boolean;
  attack: boolean;
  attackJustDown: boolean;
  down: boolean;
}

export interface PlayerStats {
  score: number;
  crystals: number;
  lives: number;
  maxLives: number;
  health: number;
  maxHealth: number;
  levelName: string;
  worldName: string;
  timeRemaining: number;
  isInvulnerable: boolean;
}

export interface SaveData {
  highScore: number;
  totalCrystals: number;
  levelCompleted: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  selectedSkin?: string;
  lastPlayedDate?: string;
}

export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER';

export interface GameEventCallbacks {
  onScoreChange: (score: number) => void;
  onCrystalCollect: (count: number, totalScore: number) => void;
  onHealthChange: (health: number, maxHealth: number, lives: number) => void;
  onPlayerHurt: () => void;
  onPlayerDeath: (livesRemaining: number) => void;
  onLevelComplete: (stats: {
    score: number;
    crystals: number;
    timeBonus: number;
    totalScore: number;
    isNewHighScore: boolean;
  }) => void;
  onGameOver: (finalScore: number, crystals: number) => void;
  onTimeUpdate: (secondsRemaining: number) => void;
}
