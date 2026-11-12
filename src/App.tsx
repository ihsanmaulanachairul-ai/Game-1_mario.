/**
 * Tiny Trails: Crystal Run - Main Application Component
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { phaserBridge } from './game/PhaserGameBridge';
import { soundManager } from './game/audio/SoundManager';
import { GameStatus, SaveData, GameEventCallbacks } from './game/types';
import { loadSaveData, saveGameData } from './utils/storage';
import { MainMenu } from './components/MainMenu';
import { GameHud } from './components/GameHud';
import { TouchControls } from './components/TouchControls';
import { PauseMenu } from './components/PauseMenu';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { Smartphone } from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('MENU');
  const [saveData, setSaveData] = useState<SaveData>(loadSaveData);

  // HUD stats
  const [score, setScore] = useState(0);
  const [crystals, setCrystals] = useState(0);
  const [health, setHealth] = useState(3);
  const [maxHealth, setMaxHealth] = useState(3);
  const [lives, setLives] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(300);

  // Modals
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [victoryStats, setVictoryStats] = useState<{
    score: number;
    crystals: number;
    timeBonus: number;
    totalScore: number;
    isNewHighScore: boolean;
  } | null>(null);

  // Orientation tracking
  const [isPortrait, setIsPortrait] = useState(
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth && window.innerWidth < 768 : false
  );

  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Handle window resizing and orientation
  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Initialize sound manager settings from save data
  useEffect(() => {
    soundManager.setSoundEnabled(saveData.soundEnabled);
    soundManager.setMusicEnabled(saveData.musicEnabled);
    soundManager.setVolume(saveData.volume);
  }, [saveData]);

  // Clean destruction when switching back to MENU
  useEffect(() => {
    if (status === 'MENU') {
      phaserBridge.destroyGame();
    }
  }, [status]);

  // Handle Pause Request
  const handlePause = useCallback(() => {
    if (status === 'PLAYING') {
      setStatus('PAUSED');
      phaserBridge.pauseGame();
    }
  }, [status]);

  const handleResume = useCallback(() => {
    if (status === 'PAUSED') {
      setStatus('PLAYING');
      phaserBridge.resumeGame();
    }
  }, [status]);

  const handleRestart = useCallback(() => {
    setStatus('PLAYING');
    setHealth(3);
    setLives(3);
    setScore(0);
    setCrystals(0);
    setTimeRemaining(300);
    phaserBridge.restartLevel();
    phaserBridge.resumeGame();
  }, []);

  const handleMainMenu = useCallback(() => {
    soundManager.stopBGM();
    phaserBridge.destroyGame();
    setStatus('MENU');
  }, []);

  const handleToggleSound = useCallback(() => {
    const next = !saveData.soundEnabled;
    soundManager.setSoundEnabled(next);
    const updated = saveGameData({ soundEnabled: next });
    setSaveData(updated);
  }, [saveData.soundEnabled]);

  // Start or resume game
  const startGame = useCallback(() => {
    setStatus('PLAYING');
    setScore(0);
    setCrystals(0);
    setHealth(3);
    setLives(3);
    setTimeRemaining(300);
  }, []);

  // Keep latest callbacks in ref to avoid recreation of Phaser instance
  const callbacksRef = useRef<GameEventCallbacks>({
    onScoreChange: (newScore) => setScore(newScore),
    onCrystalCollect: (count, totalScore) => {
      setCrystals(count);
      setScore(totalScore);
    },
    onHealthChange: (h, mh, l) => {
      setHealth(h);
      setMaxHealth(mh);
      setLives(l);
    },
    onPlayerHurt: () => {},
    onPlayerDeath: (rem) => {
      setLives(rem);
    },
    onLevelComplete: (stats) => {
      const isNewHighScore = stats.totalScore > saveData.highScore;
      const updated = saveGameData({
        highScore: Math.max(saveData.highScore, stats.totalScore),
        totalCrystals: saveData.totalCrystals + stats.crystals,
        levelCompleted: true,
      });
      setSaveData(updated);
      setVictoryStats({ ...stats, isNewHighScore });
      setStatus('VICTORY');
    },
    onGameOver: (finalScore, finalCrystals) => {
      if (finalScore > saveData.highScore) {
        const updated = saveGameData({
          highScore: finalScore,
          totalCrystals: saveData.totalCrystals + finalCrystals,
        });
        setSaveData(updated);
      }
      setStatus('GAMEOVER');
    },
    onTimeUpdate: (remaining) => setTimeRemaining(remaining),
  });

  // Keep callbacksRef up-to-date with latest closure state
  useEffect(() => {
    callbacksRef.current = {
      onScoreChange: (newScore) => setScore(newScore),
      onCrystalCollect: (count, totalScore) => {
        setCrystals(count);
        setScore(totalScore);
      },
      onHealthChange: (h, mh, l) => {
        setHealth(h);
        setMaxHealth(mh);
        setLives(l);
      },
      onPlayerHurt: () => {},
      onPlayerDeath: (rem) => {
        setLives(rem);
      },
      onLevelComplete: (stats) => {
        const isNewHighScore = stats.totalScore > saveData.highScore;
        const updated = saveGameData({
          highScore: Math.max(saveData.highScore, stats.totalScore),
          totalCrystals: saveData.totalCrystals + stats.crystals,
          levelCompleted: true,
        });
        setSaveData(updated);
        setVictoryStats({ ...stats, isNewHighScore });
        setStatus('VICTORY');
      },
      onGameOver: (finalScore, finalCrystals) => {
        if (finalScore > saveData.highScore) {
          const updated = saveGameData({
            highScore: finalScore,
            totalCrystals: saveData.totalCrystals + finalCrystals,
          });
          setSaveData(updated);
        }
        setStatus('GAMEOVER');
      },
      onTimeUpdate: (remaining) => setTimeRemaining(remaining),
    };
    phaserBridge.setCallbacks(callbacksRef.current);
  }, [saveData.highScore, saveData.totalCrystals]);

  // Mount Phaser when gameContainerRef becomes available in PLAYING mode
  useEffect(() => {
    if (status !== 'MENU' && gameContainerRef.current) {
      if (!phaserBridge.isInitialized()) {
        phaserBridge.initGame(
          gameContainerRef.current,
          callbacksRef.current,
          handlePause
        );
      }
    }
  }, [status, handlePause]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans no-touch-callout select-none">
      {/* 1. Main Menu */}
      {status === 'MENU' && (
        <MainMenu
          saveData={saveData}
          onPlayNow={startGame}
          onContinue={startGame}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* 2. Active Game Screen */}
      {status !== 'MENU' && (
        <div className={`relative w-full h-full flex ${isPortrait ? 'flex-col justify-between' : 'items-center justify-center'}`}>
          {/* Top HUD */}
          <GameHud
            score={score}
            crystals={crystals}
            health={health}
            maxHealth={maxHealth}
            lives={lives}
            timeRemaining={timeRemaining}
            soundEnabled={saveData.soundEnabled}
            onToggleSound={handleToggleSound}
            onPause={handlePause}
          />

          {/* Portrait Suggestion Notice */}
          {isPortrait && (
            <aside aria-label="Device orientation recommendation" className="pt-12 px-3 py-1 bg-amber-950/60 border-b border-amber-700/50 text-[11px] text-amber-300 flex items-center justify-center gap-1.5 shrink-0">
              <Smartphone className="w-3.5 h-3.5 rotate-90 shrink-0" />
              <span>Rotate device to landscape for full screen immersion</span>
            </aside>
          )}

          {/* Phaser Canvas Container */}
          <div
            className={`relative flex items-center justify-center overflow-hidden ${
              isPortrait ? 'w-full flex-1 max-h-[58vh] bg-slate-900' : 'w-full h-full'
            }`}
          >
            <div
              ref={gameContainerRef}
              className="w-full h-full flex items-center justify-center [&>canvas]:max-w-full [&>canvas]:max-h-full [&>canvas]:object-contain shadow-2xl"
            />
          </div>

          {/* Touch Controls for Mobile */}
          <TouchControls isPortrait={isPortrait} />

          {/* Overlays / Modals */}
          {status === 'PAUSED' && (
            <PauseMenu
              soundEnabled={saveData.soundEnabled}
              onToggleSound={handleToggleSound}
              onResume={handleResume}
              onRestart={handleRestart}
              onMainMenu={handleMainMenu}
            />
          )}

          {status === 'VICTORY' && victoryStats && (
            <VictoryModal
              stats={victoryStats}
              onReplay={handleRestart}
              onMainMenu={handleMainMenu}
            />
          )}

          {status === 'GAMEOVER' && (
            <GameOverModal
              score={score}
              crystals={crystals}
              onRetry={handleRestart}
              onMainMenu={handleMainMenu}
            />
          )}
        </div>
      )}

      {/* Auxiliary Modals from Menu */}
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
      {showSettings && (
        <SettingsModal
          saveData={saveData}
          onUpdateSaveData={(updated) => setSaveData((prev) => ({ ...prev, ...updated }))}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
