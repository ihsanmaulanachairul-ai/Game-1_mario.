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

export interface BossInfo {
  name: string;
  health: number;
  maxHealth: number;
  active: boolean;
}

export interface SaveData {
  highScore: number;
  totalCrystals: number;
  unlockedLevel: number; // 1 to 10
  highestLevelCompleted: number; // 0 to 10
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  selectedSkin?: string;
  lastPlayedDate?: string;
}

export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER';

export interface LevelDefinition {
  number: number;
  title: string;
  worldName: string;
  theme: 'meadow' | 'cavern' | 'boss';
  width: number;
  description: string;
  parTime: number;
  targetCrystals: number;
}

export interface GameEventCallbacks {
  onScoreChange: (score: number) => void;
  onCrystalCollect: (count: number, totalScore: number) => void;
  onHealthChange: (health: number, maxHealth: number, lives: number) => void;
  onPlayerHurt: () => void;
  onPlayerDeath: (livesRemaining: number) => void;
  onLevelComplete: (stats: {
    levelNumber: number;
    score: number;
    crystals: number;
    timeBonus: number;
    totalScore: number;
    isNewHighScore: boolean;
    isGameComplete: boolean;
  }) => void;
  onGameOver: (finalScore: number, crystals: number) => void;
  onTimeUpdate: (secondsRemaining: number) => void;
  onBossStateUpdate?: (boss: BossInfo | null) => void;
}
