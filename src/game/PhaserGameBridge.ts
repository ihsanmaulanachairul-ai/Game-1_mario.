/**
 * PhaserGameBridge
 * Manages the single Phaser.Game instance, lifecycle, input synthesis (keyboard + touch),
 * and clean communication with React components across all 10 levels.
 */

import Phaser from 'phaser';
import { GreenfieldScene } from './scenes/GreenfieldScene';
import { GameEventCallbacks, InputState } from './types';

class PhaserGameBridge {
  private game: Phaser.Game | null = null;
  private scene: GreenfieldScene | null = null;
  private container: HTMLElement | null = null;
  private isDestroying: boolean = false;
  private currentLevel: number = 1;

  private currentInput: InputState = {
    left: false,
    right: false,
    jump: false,
    jumpJustDown: false,
    sprint: false,
    attack: false,
    attackJustDown: false,
    down: false,
  };

  // Keyboard tracking
  private keyboardState = {
    left: false,
    right: false,
    jump: false,
    sprint: false,
    attack: false,
    down: false,
  };

  // Touch tracking
  private touchState = {
    left: false,
    right: false,
    jump: false,
    sprint: false,
    attack: false,
    down: false,
  };

  private callbacks: Partial<GameEventCallbacks> = {};
  private onPauseCallback: (() => void) | null = null;

  public isInitialized(): boolean {
    return Boolean(this.game && !this.isDestroying);
  }

  public getCallbacks(): Partial<GameEventCallbacks> {
    return this.callbacks;
  }

  public getInputState(): InputState {
    return this.currentInput;
  }

  public getLevel(): number {
    return this.currentLevel;
  }

  public setLevel(lvl: number): void {
    this.currentLevel = Math.max(1, Math.min(10, lvl));
    if (this.scene && this.scene.scene && this.scene.scene.isActive()) {
      this.restartLevel(this.currentLevel);
    }
  }

  public clearJustDown(): void {
    this.currentInput.jumpJustDown = false;
    this.currentInput.attackJustDown = false;
  }

  public initGame(container: HTMLElement, callbacks: GameEventCallbacks, onPauseRequest?: () => void, levelNumber = 1): void {
    this.currentLevel = Math.max(1, Math.min(10, levelNumber));

    if (this.game || this.isDestroying) {
      this.callbacks = callbacks;
      this.onPauseCallback = onPauseRequest || null;
      if (this.scene) {
        this.scene.setCallbacks(callbacks);
      }
      return;
    }

    this.container = container;
    this.callbacks = callbacks;
    this.onPauseCallback = onPauseRequest || null;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: container,
      width: 480,
      height: 270,
      pixelArt: true,
      roundPixels: true,
      backgroundColor: '#38bdf8',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 850 },
          debug: false,
        },
      },
      scene: [GreenfieldScene],
    };

    this.game = new Phaser.Game(config);

    this.game.events.once('ready', () => {
      if (!this.game) return;
      this.scene = this.game.scene.getScene('GreenfieldScene') as GreenfieldScene;
      if (this.scene) {
        this.scene.setCallbacks(this.callbacks);
      }
    });

    this.bindKeyboard();
  }

  public setCallbacks(callbacks: Partial<GameEventCallbacks>) {
    this.callbacks = callbacks;
    if (this.scene) {
      this.scene.setCallbacks(callbacks);
    }
  }

  public setOnPauseCallback(cb: () => void) {
    this.onPauseCallback = cb;
  }

  private bindKeyboard(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private unbindKeyboard(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

    let handled = false;

    if (e.code === 'KeyP' || e.code === 'Escape') {
      this.onPauseCallback?.();
      handled = true;
    } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.keyboardState.left = true;
      handled = true;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.keyboardState.right = true;
      handled = true;
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
      if (!this.keyboardState.jump) {
        this.currentInput.jumpJustDown = true;
      }
      this.keyboardState.jump = true;
      handled = true;
    } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this.keyboardState.sprint = true;
      handled = true;
    } else if (e.code === 'KeyX' || e.code === 'KeyJ') {
      if (!this.keyboardState.attack) {
        this.currentInput.attackJustDown = true;
      }
      this.keyboardState.attack = true;
      handled = true;
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      this.keyboardState.down = true;
      handled = true;
    }

    if (handled) {
      this.syncInputs();
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.keyboardState.left = false;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.keyboardState.right = false;
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
      this.keyboardState.jump = false;
    } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this.keyboardState.sprint = false;
    } else if (e.code === 'KeyX' || e.code === 'KeyJ') {
      this.keyboardState.attack = false;
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      this.keyboardState.down = false;
    }

    this.syncInputs();
  };

  public setTouchInput(action: keyof typeof this.touchState, isDown: boolean): void {
    if (action === 'jump' && isDown && !this.touchState.jump) {
      this.currentInput.jumpJustDown = true;
    }
    if (action === 'attack' && isDown && !this.touchState.attack) {
      this.currentInput.attackJustDown = true;
    }

    this.touchState[action] = isDown;
    this.syncInputs();
  }

  private syncInputs(): void {
    this.currentInput.left = this.keyboardState.left || this.touchState.left;
    this.currentInput.right = this.keyboardState.right || this.touchState.right;
    this.currentInput.jump = this.keyboardState.jump || this.touchState.jump;
    this.currentInput.sprint = this.keyboardState.sprint || this.touchState.sprint;
    this.currentInput.attack = this.keyboardState.attack || this.touchState.attack;
    this.currentInput.down = this.keyboardState.down || this.touchState.down;

    if (this.scene) {
      this.scene.setInputState(this.currentInput);
    }
  }

  public pauseGame(): void {
    if (this.game && !this.game.isPaused) {
      this.game.pause();
    }
  }

  public resumeGame(): void {
    if (this.game && this.game.isPaused) {
      this.game.resume();
    }
  }

  public restartLevel(newLevelNumber?: number): void {
    if (typeof newLevelNumber === 'number') {
      this.currentLevel = Math.max(1, Math.min(10, newLevelNumber));
    }
    if (this.scene && this.scene.scene) {
      this.scene.scene.restart({ levelNumber: this.currentLevel });
    } else if (this.game) {
      const activeScene = this.game.scene.getScene('GreenfieldScene');
      if (activeScene) {
        activeScene.scene.restart({ levelNumber: this.currentLevel });
      }
    }
  }

  public destroyGame(): void {
    if (!this.game || this.isDestroying) return;

    this.isDestroying = true;
    this.unbindKeyboard();

    try {
      this.game.destroy(true, false);
    } catch (err) {
      console.warn('Error during Phaser destruction:', err);
    }

    this.game = null;
    this.scene = null;
    this.container = null;
    this.isDestroying = false;
  }
}

export const phaserBridge = new PhaserGameBridge();
