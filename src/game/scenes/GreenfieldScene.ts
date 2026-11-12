/**
 * GreenfieldScene - Multi-Level Arcade Platformer Engine with Level 10 Boss Battle
 * Core Phaser 3 Scene for Tiny Trails: Crystal Run.
 */

import Phaser from 'phaser';
import { InputState, GameEventCallbacks, BossInfo } from '../types';
import { PixelAssetGenerator } from '../graphics/PixelAssetGenerator';
import { soundManager } from '../audio/SoundManager';
import { phaserBridge } from '../PhaserGameBridge';
import { getLevelConfig } from '../levels/levelConfigs';

export class GreenfieldScene extends Phaser.Scene {
  private levelNumber: number = 1;

  // Input state
  private inputState: InputState = {
    left: false,
    right: false,
    jump: false,
    jumpJustDown: false,
    sprint: false,
    attack: false,
    attackJustDown: false,
    down: false,
  };

  private callbacks: Partial<GameEventCallbacks> = {};

  // Game Entities
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatforms: Array<{ sprite: Phaser.Physics.Arcade.Sprite; min: number; max: number; speed: number; axis: 'x' | 'y' }> = [];
  private spikes!: Phaser.Physics.Arcade.StaticGroup;
  private mysteryCrates!: Phaser.Physics.Arcade.StaticGroup;
  private crystals!: Phaser.Physics.Arcade.Group;
  private springs!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private exitGate!: Phaser.Physics.Arcade.Sprite;

  // Boss Battle Entities (Level 10)
  private bossSprite: Phaser.Physics.Arcade.Sprite | null = null;
  private bossProjectiles!: Phaser.Physics.Arcade.Group;
  private bossShockwaves!: Phaser.Physics.Arcade.Group;
  private bossHealth: number = 5;
  private readonly MAX_BOSS_HEALTH: number = 5;
  private isBossActive: boolean = false;
  private isBossStunned: boolean = false;
  private bossStateTimer: number = 0;
  private bossActionPhase: 'walk' | 'slam' | 'stunned' | 'defeated' = 'walk';
  private bossMoveDir: number = 1;

  // Background parallax layers
  private bgDecorObjects: Phaser.GameObjects.GameObject[] = [];

  // Player state variables
  private score: number = 0;
  private crystalsCollected: number = 0;
  private health: number = 3;
  private maxHealth: number = 3;
  private lives: number = 3;
  private isInvulnerable: boolean = false;
  private isAttacking: boolean = false;
  private isDead: boolean = false;
  private isLevelComplete: boolean = false;

  // Variable Jump mechanics
  private isJumping: boolean = false;
  private jumpHoldTimer: number = 0;
  private readonly MAX_JUMP_HOLD_TIME: number = 180; // ms
  private coyoteTimer: number = 0;
  private readonly COYOTE_TIME: number = 100; // ms
  private jumpBufferTimer: number = 0;
  private readonly JUMP_BUFFER_TIME: number = 120; // ms

  // Level dimensions
  private levelWidth: number = 2500;
  private readonly LEVEL_HEIGHT: number = 360;

  // Level Timer
  private timeRemaining: number = 300;
  private timerEvent: Phaser.Time.TimerEvent | null = null;

  // Checkpoints
  private respawnX: number = 60;
  private respawnY: number = 220;

  constructor() {
    super({ key: 'GreenfieldScene' });
  }

  public init(data?: { levelNumber?: number; callbacks?: Partial<GameEventCallbacks> }) {
    if (data && typeof data.levelNumber === 'number') {
      this.levelNumber = Math.max(1, Math.min(10, data.levelNumber));
    } else {
      this.levelNumber = phaserBridge.getLevel();
    }

    if (data && data.callbacks) {
      this.callbacks = data.callbacks;
    } else {
      this.callbacks = phaserBridge.getCallbacks();
    }
  }

  public setCallbacks(callbacks: Partial<GameEventCallbacks>) {
    this.callbacks = callbacks;
  }

  public setInputState(state: InputState) {
    this.inputState = { ...state };
  }

  public preload(): void {
    PixelAssetGenerator.generateAll(this);
  }

  public create(): void {
    const config = getLevelConfig(this.levelNumber);
    this.levelWidth = config.width;

    this.isDead = false;
    this.isLevelComplete = false;
    this.isInvulnerable = false;
    this.isAttacking = false;
    this.isJumping = false;
    this.score = 0;
    this.crystalsCollected = 0;
    this.health = 3;
    this.lives = 3;
    this.timeRemaining = config.parTime;
    this.respawnX = 60;
    this.respawnY = 220;

    // Boss Reset
    this.bossSprite = null;
    this.isBossActive = this.levelNumber === 10;
    this.bossHealth = this.MAX_BOSS_HEALTH;
    this.isBossStunned = false;
    this.bossActionPhase = 'walk';
    this.bossStateTimer = 0;
    this.movingPlatforms = [];

    // Clear background objects
    this.bgDecorObjects.forEach((obj) => obj.destroy());
    this.bgDecorObjects = [];

    // Ensure callbacks are populated
    if (Object.keys(this.callbacks).length === 0) {
      this.callbacks = phaserBridge.getCallbacks();
    }

    // Set world physics bounds
    this.physics.world.setBounds(0, 0, this.levelWidth, this.LEVEL_HEIGHT);
    this.physics.world.gravity.y = 850;

    // Create Animations
    this.createAnimations();

    // Create Parallax Backgrounds based on level theme
    this.createBackgrounds(config.theme);

    // Create Physics Groups
    this.platforms = this.physics.add.staticGroup();
    this.spikes = this.physics.add.staticGroup();
    this.mysteryCrates = this.physics.add.staticGroup();
    this.springs = this.physics.add.staticGroup();
    this.crystals = this.physics.add.group({ allowGravity: false });
    this.enemies = this.physics.add.group();
    this.bossProjectiles = this.physics.add.group({ allowGravity: false });
    this.bossShockwaves = this.physics.add.group({ allowGravity: false });

    // Build the specific Level Layout
    this.buildLevel(config);

    // Create Player (Pip)
    this.createPlayer();

    // Setup Collisions
    this.setupCollisions();

    // Setup Camera
    this.cameras.main.setBounds(0, 0, this.levelWidth, this.LEVEL_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1, 0, 30);
    this.cameras.main.setDeadzone(60, 40);

    // Level Timer Countdown
    if (this.timerEvent) {
      this.timerEvent.remove();
    }
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (!this.sys || !this.scene.isActive()) return;
        if (!this.isLevelComplete && !this.isDead && this.timeRemaining > 0) {
          this.timeRemaining--;
          this.callbacks.onTimeUpdate?.(this.timeRemaining);
          if (this.timeRemaining <= 0) {
            this.handlePlayerDeath();
          }
        }
      },
    });

    // Notify initial HUD stats
    this.callbacks.onScoreChange?.(this.score);
    this.callbacks.onCrystalCollect?.(this.crystalsCollected, this.score);
    this.callbacks.onHealthChange?.(this.health, this.maxHealth, this.lives);
    this.callbacks.onTimeUpdate?.(this.timeRemaining);

    if (this.isBossActive) {
      this.callbacks.onBossStateUpdate?.({
        name: 'Gorgath, Crystal Colossus',
        health: this.bossHealth,
        maxHealth: this.MAX_BOSS_HEALTH,
        active: true,
      });
    } else {
      this.callbacks.onBossStateUpdate?.(null);
    }

    // Start background melody matching level theme
    soundManager.startBGM(config.theme);
  }

  private createAnimations(): void {
    // Pip animations
    if (!this.anims.exists('pip-idle')) {
      this.anims.create({
        key: 'pip-idle',
        frames: this.anims.generateFrameNumbers('pip', { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1,
      });
      this.anims.create({
        key: 'pip-walk',
        frames: this.anims.generateFrameNumbers('pip', { start: 4, end: 7 }),
        frameRate: 9,
        repeat: -1,
      });
      this.anims.create({
        key: 'pip-run',
        frames: this.anims.generateFrameNumbers('pip', { start: 8, end: 11 }),
        frameRate: 13,
        repeat: -1,
      });
      this.anims.create({
        key: 'pip-jump',
        frames: this.anims.generateFrameNumbers('pip', { start: 12, end: 13 }),
        frameRate: 6,
        repeat: 0,
      });
      this.anims.create({
        key: 'pip-fall',
        frames: this.anims.generateFrameNumbers('pip', { start: 14, end: 15 }),
        frameRate: 6,
        repeat: -1,
      });
      this.anims.create({
        key: 'pip-land',
        frames: this.anims.generateFrameNumbers('pip', { start: 16, end: 17 }),
        frameRate: 10,
        repeat: 0,
      });
      this.anims.create({
        key: 'pip-attack',
        frames: this.anims.generateFrameNumbers('pip', { start: 18, end: 21 }),
        frameRate: 15,
        repeat: 0,
      });
      this.anims.create({
        key: 'pip-hurt',
        frames: this.anims.generateFrameNumbers('pip', { start: 22, end: 23 }),
        frameRate: 8,
        repeat: -1,
      });
    }

    // Slime animations
    if (!this.anims.exists('slime-crawl')) {
      this.anims.create({
        key: 'slime-crawl',
        frames: this.anims.generateFrameNumbers('slime', { start: 0, end: 2 }),
        frameRate: 6,
        repeat: -1,
      });
    }

    // Beetle animations
    if (!this.anims.exists('beetle-crawl')) {
      this.anims.create({
        key: 'beetle-crawl',
        frames: this.anims.generateFrameNumbers('beetle', { start: 0, end: 3 }),
        frameRate: 7,
        repeat: -1,
      });
    }

    // Crystal spinning animation
    if (!this.anims.exists('crystal-shine')) {
      this.anims.create({
        key: 'crystal-shine',
        frames: this.anims.generateFrameNumbers('crystal', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1,
      });
    }

    // Boss Gorgath animations
    if (!this.anims.exists('boss-walk')) {
      this.anims.create({
        key: 'boss-walk',
        frames: this.anims.generateFrameNumbers('boss-gorgath', { start: 0, end: 2 }),
        frameRate: 4,
        repeat: -1,
      });
      this.anims.create({
        key: 'boss-slam',
        frames: [{ key: 'boss-gorgath', frame: 3 }],
        frameRate: 1,
      });
      this.anims.create({
        key: 'boss-stunned',
        frames: [{ key: 'boss-gorgath', frame: 4 }],
        frameRate: 1,
      });
      this.anims.create({
        key: 'boss-defeated',
        frames: [{ key: 'boss-gorgath', frame: 5 }],
        frameRate: 1,
      });
    }
  }

  private createBackgrounds(theme: 'meadow' | 'cavern' | 'boss'): void {
    const sky = this.add.graphics();

    if (theme === 'cavern') {
      // Subterranean purple-dark slate gradient
      sky.fillGradientStyle(0x0f172a, 0x0f172a, 0x2e1065, 0x1e1b4b, 1);
      sky.fillRect(0, 0, this.levelWidth, this.LEVEL_HEIGHT);
      sky.setScrollFactor(0);
      this.bgDecorObjects.push(sky);

      // Hanging stalactites
      for (let x = 40; x < this.levelWidth + 200; x += 110) {
        const stal = this.add.image(x, 0, 'bg-stalactite').setOrigin(0.5, 0).setScrollFactor(0.2).setAlpha(0.7);
        this.bgDecorObjects.push(stal);
      }
    } else if (theme === 'boss') {
      // The Ancient Sanctum: Dramatic royal purple and glowing cyan vault
      sky.fillGradientStyle(0x090d16, 0x090d16, 0x311042, 0x1e1b4b, 1);
      sky.fillRect(0, 0, this.levelWidth, this.LEVEL_HEIGHT);
      sky.setScrollFactor(0);
      this.bgDecorObjects.push(sky);

      // Grand Runic Sanctuary Archways
      for (let x = 80; x < this.levelWidth; x += 180) {
        const arch = this.add.rectangle(x, 140, 16, 260, 0x1e293b).setOrigin(0.5, 0).setScrollFactor(0.15).setAlpha(0.6);
        const rune = this.add.rectangle(x, 180, 8, 40, 0x38bdf8).setOrigin(0.5, 0).setScrollFactor(0.15).setAlpha(0.8);
        this.bgDecorObjects.push(arch, rune);
      }
    } else {
      // Vibrant meadow sky
      sky.fillGradientStyle(0x38bdf8, 0x38bdf8, 0xbae6fd, 0xbae6fd, 1);
      sky.fillRect(0, 0, this.levelWidth, this.LEVEL_HEIGHT);
      sky.setScrollFactor(0);
      this.bgDecorObjects.push(sky);

      // Mountains
      for (let x = 0; x < this.levelWidth + 300; x += 180) {
        const mtn = this.add.image(x, 220, 'bg-mountain').setOrigin(0.5, 1).setScrollFactor(0.15).setAlpha(0.65);
        this.bgDecorObjects.push(mtn);
      }

      // Rolling Hills
      for (let x = 0; x < this.levelWidth + 200; x += 120) {
        const hill = this.add.image(x, 280, 'bg-hill').setOrigin(0.5, 1).setScrollFactor(0.35);
        this.bgDecorObjects.push(hill);
      }

      // Fluffy Clouds
      for (let i = 0; i < Math.max(12, Math.floor(this.levelWidth / 150)); i++) {
        const cx = Phaser.Math.Between(40, this.levelWidth);
        const cy = Phaser.Math.Between(20, 110);
        const cloud = this.add.image(cx, cy, 'bg-cloud').setScrollFactor(0.25).setScale(Phaser.Math.FloatBetween(0.8, 1.3));
        this.bgDecorObjects.push(cloud);
      }
    }
  }

  private createPlayer(): void {
    this.player = this.physics.add.sprite(this.respawnX, this.respawnY, 'pip', 0);
    this.player.setCollideWorldBounds(true);
    this.player.body?.setSize(12, 18);
    this.player.body?.setOffset(6, 6);
    this.player.play('pip-idle');
  }

  // --- Dynamic Level Layout Builder ---

  private buildLevel(config: ReturnType<typeof getLevelConfig>): void {
    const isCavern = config.theme === 'cavern';
    const topTileKey = isCavern ? 'tile-cave-top' : 'tile-grass-top';
    const dirtTileKey = isCavern ? 'tile-cave-dirt' : 'tile-dirt';

    if (config.theme === 'boss') {
      // Level 10: The Ancient Sanctum (Boss Arena)
      this.buildBossArena();
      return;
    }

    // Procedural algorithmic layout customized per level difficulty & length
    const lvl = config.number;

    // Ground segments with pits
    const groundSegments = [
      { start: 0, end: 450 + lvl * 10 },
      { start: 540 + lvl * 15, end: 1050 + lvl * 20 },
      { start: 1140 + lvl * 20, end: 1750 + lvl * 20 },
      { start: 1850 + lvl * 25, end: this.levelWidth },
    ];

    groundSegments.forEach((seg) => {
      this.createGroundSegment(seg.start, seg.end, 270, topTileKey, dirtTileKey);
    });

    // Elevated platforms & stepping stones
    const numPlatforms = 6 + lvl;
    for (let i = 0; i < numPlatforms; i++) {
      const px = 180 + i * 190 + (lvl % 2) * 20;
      const py = 220 - (i % 3) * 35;
      const width = Math.max(3, 5 - Math.floor(lvl / 3));
      this.createPlatform(px, py, width, topTileKey);

      // Crystals on platforms
      this.createCrystal(px + 16, py - 20);
      if (width > 3) this.createCrystal(px + 32, py - 20);

      // Mystery Crates
      if (i % 3 === 1) {
        this.createMysteryCrate(px + 8, py - 35, i % 6 === 1 ? 'heart' : 'crystal');
      }
    }

    // Bridges over pits
    this.createBridge(460 + lvl * 10, 230, 4);
    this.createBridge(1060 + lvl * 20, 220, 4);

    // Spring Mushrooms
    this.createSpringMushroom(620, 260);
    this.createSpringMushroom(1450, 260);
    if (lvl >= 4) {
      this.createSpringMushroom(2050, 260);
    }

    // High crystals reachable via springs
    this.createCrystal(620, 130);
    this.createCrystal(640, 110);
    this.createCrystal(1450, 130);
    this.createCrystal(1470, 110);

    // Hazards: Spikes (introduced in Level 4+)
    if (lvl >= 4) {
      const spikeXPositions = [720, 1260, 1920, 2240];
      spikeXPositions.forEach((sx) => {
        if (sx < this.levelWidth - 250) {
          this.createSpikes(sx, 270, 2 + Math.min(3, Math.floor(lvl / 2)));
        }
      });
    }

    // Moving Platforms (introduced in Level 5+)
    if (lvl >= 5) {
      const plat1 = this.createMovingPlatform(850, 200, 780, 950, 40, 'x');
      const plat2 = this.createMovingPlatform(1600, 180, 130, 210, 35, 'y');
      this.movingPlatforms.push(plat1, plat2);
    }

    // Patrol Enemies: Slimes & Beetles
    const enemyCount = 4 + Math.floor(lvl * 1.2);
    for (let e = 0; e < enemyCount; e++) {
      const ex = 360 + e * 220 + Phaser.Math.Between(-30, 30);
      if (ex > 120 && ex < this.levelWidth - 200) {
        if (e % 2 === 0) {
          this.createSlime(ex, 250, ex - 60, ex + 60);
        } else {
          this.createBeetle(ex, 250, ex - 70, ex + 70);
        }
      }
    }

    // Environmental flora decor
    if (!isCavern) {
      for (let x = 60; x < this.levelWidth - 200; x += 140) {
        this.add.image(x, 260, 'tile-bush');
        this.add.image(x + 40, 264, 'tile-flower');
      }
    }

    // Exit Gate (World Goal)
    this.exitGate = this.physics.add.sprite(this.levelWidth - 80, 242, 'exit-gate');
    this.exitGate.setImmovable(true);
    if (this.exitGate.body) {
      (this.exitGate.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      this.exitGate.body.setSize(28, 44);
    }

    this.tweens.add({
      targets: this.exitGate,
      alpha: { from: 0.85, to: 1.0 },
      yoyo: true,
      repeat: -1,
      duration: 700,
    });
  }

  /**
   * Level 10: Boss Arena for Gorgath the Crystal Colossus
   */
  private buildBossArena(): void {
    const arenaW = this.levelWidth; // 860px

    // 1. Solid Arena Floor & Side Walls
    this.createGroundSegment(0, arenaW, 260, 'tile-cave-top', 'tile-cave-dirt');

    // Left and Right Enclosing Walls
    for (let y = 0; y < 260; y += 16) {
      this.platforms.create(8, y + 8, 'block-stone').refreshBody();
      this.platforms.create(arenaW - 8, y + 8, 'block-stone').refreshBody();
    }

    // 2. Elevated Strategic Platforms for Pip to leap and dodge
    this.createPlatform(100, 190, 4, 'tile-cave-top');
    this.createPlatform(arenaW - 164, 190, 4, 'tile-cave-top');
    this.createPlatform(arenaW / 2 - 32, 160, 4, 'tile-cave-top');

    // High spring mushrooms on both sides
    this.createSpringMushroom(60, 250);
    this.createSpringMushroom(arenaW - 60, 250);

    // Mystery Crates with life-saving hearts
    this.createMysteryCrate(120, 140, 'heart');
    this.createMysteryCrate(arenaW - 140, 140, 'heart');
    this.createMysteryCrate(arenaW / 2, 110, 'crystal');

    // Decorative crystals
    this.createCrystal(100, 160);
    this.createCrystal(arenaW - 120, 160);
    this.createCrystal(arenaW / 2, 130);

    // 3. Spawn Boss: Gorgath
    this.bossSprite = this.physics.add.sprite(arenaW - 180, 210, 'boss-gorgath', 0);
    this.bossSprite.setCollideWorldBounds(true);
    this.bossSprite.setBounce(0.1);
    if (this.bossSprite.body) {
      this.bossSprite.body.setSize(36, 42);
      this.bossSprite.body.setOffset(6, 6);
    }
    this.bossSprite.play('boss-walk');
    this.bossMoveDir = -1;

    soundManager.playBossRoar();
  }

  private createGroundSegment(startX: number, endX: number, surfaceY: number, topKey = 'tile-grass-top', dirtKey = 'tile-dirt'): void {
    const tileW = 16;
    for (let x = startX; x <= endX; x += tileW) {
      const topTile = this.platforms.create(x + tileW / 2, surfaceY + tileW / 2, topKey);
      topTile.refreshBody();

      for (let y = surfaceY + tileW; y < this.LEVEL_HEIGHT; y += tileW) {
        this.add.image(x + tileW / 2, y + tileW / 2, dirtKey);
      }
    }
  }

  private createPlatform(startX: number, surfaceY: number, widthInTiles: number, topKey = 'tile-grass-top'): void {
    const tileW = 16;
    for (let i = 0; i < widthInTiles; i++) {
      const x = startX + i * tileW + tileW / 2;
      const y = surfaceY + tileW / 2;
      const tile = this.platforms.create(x, y, topKey);
      tile.refreshBody();
    }
  }

  private createBridge(startX: number, surfaceY: number, widthInTiles: number): void {
    const tileW = 16;
    for (let i = 0; i < widthInTiles; i++) {
      const x = startX + i * tileW + tileW / 2;
      const y = surfaceY + tileW / 2;
      const tile = this.platforms.create(x, y, 'tile-bridge');
      tile.refreshBody();
    }
  }

  private createSpikes(startX: number, surfaceY: number, count = 2): void {
    const tileW = 16;
    for (let i = 0; i < count; i++) {
      const spike = this.spikes.create(startX + i * tileW + tileW / 2, surfaceY - tileW / 2, 'tile-spike');
      spike.body.setSize(14, 10);
      spike.body.setOffset(1, 6);
      spike.refreshBody();
    }
  }

  private createMovingPlatform(x: number, y: number, min: number, max: number, speed: number, axis: 'x' | 'y') {
    const plat = this.physics.add.sprite(x, y, 'tile-moving-plat');
    plat.setImmovable(true);
    if (plat.body) {
      (plat.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      plat.body.setSize(32, 10);
    }
    return { sprite: plat, min, max, speed, axis };
  }

  private createStoneBlock(x: number, y: number): void {
    const block = this.platforms.create(x, y, 'block-stone');
    block.refreshBody();
  }

  private createMysteryCrate(x: number, y: number, reward: 'crystal' | 'heart'): void {
    const crate = this.mysteryCrates.create(x, y, 'crate-active');
    crate.setData('reward', reward);
    crate.setData('spent', false);
    crate.refreshBody();
  }

  private createSpringMushroom(x: number, y: number): void {
    const spring = this.springs.create(x, y, 'spring-idle');
    spring.body.setSize(16, 12);
    spring.body.setOffset(0, 4);
    spring.refreshBody();
  }

  private createCrystal(x: number, y: number): void {
    const crystal = this.crystals.create(x, y, 'crystal');
    crystal.play('crystal-shine');
    crystal.body.setSize(12, 12);
    this.tweens.add({
      targets: crystal,
      y: y - 4,
      duration: 1000 + Phaser.Math.Between(-100, 100),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createSlime(x: number, y: number, minX: number, maxX: number): void {
    const slime = this.physics.add.sprite(x, y, 'slime', 0);
    slime.play('slime-crawl');
    slime.setBounce(0.1);
    slime.setCollideWorldBounds(true);
    slime.body?.setSize(14, 10);
    slime.body?.setOffset(1, 6);
    slime.setData('minX', minX);
    slime.setData('maxX', maxX);
    slime.setData('speed', 45);
    slime.setData('direction', 1);
    slime.setData('isSquashed', false);
    slime.setVelocityX(45);
    this.enemies.add(slime);
  }

  private createBeetle(x: number, y: number, minX: number, maxX: number): void {
    const beetle = this.physics.add.sprite(x, y, 'beetle', 0);
    beetle.play('beetle-crawl');
    beetle.setBounce(0.1);
    beetle.setCollideWorldBounds(true);
    beetle.body?.setSize(16, 12);
    beetle.body?.setOffset(2, 4);
    beetle.setData('minX', minX);
    beetle.setData('maxX', maxX);
    beetle.setData('speed', 60);
    beetle.setData('direction', -1);
    beetle.setData('isSquashed', false);
    beetle.setVelocityX(-60);
    beetle.setFlipX(true);
    this.enemies.add(beetle);
  }

  private setupCollisions(): void {
    // Player on Platforms
    this.physics.add.collider(this.player, this.platforms);

    // Player with Moving Platforms
    this.movingPlatforms.forEach((mp) => {
      this.physics.add.collider(this.player, mp.sprite);
    });

    // Player with Spikes (Hazards)
    this.physics.add.overlap(this.player, this.spikes, () => {
      this.takeDamage();
    });

    // Player with Mystery Crates
    this.physics.add.collider(this.player, this.mysteryCrates, (playerObj, crateObj) => {
      this.handleCrateCollision(playerObj as Phaser.GameObjects.GameObject, crateObj as Phaser.Physics.Arcade.Sprite);
    });

    // Enemies on Platforms
    this.physics.add.collider(this.enemies, this.platforms);

    // Player with Springs
    this.physics.add.overlap(this.player, this.springs, (_player, springObj) => {
      this.handleSpringBounce(springObj as Phaser.Physics.Arcade.Sprite);
    });

    // Player with Crystals
    this.physics.add.overlap(this.player, this.crystals, (_player, crystalObj) => {
      this.handleCrystalCollect(crystalObj as Phaser.Physics.Arcade.Sprite);
    });

    // Player with Enemies
    this.physics.add.overlap(this.player, this.enemies, (_player, enemyObj) => {
      this.handleEnemyEncounter(enemyObj as Phaser.Physics.Arcade.Sprite);
    });

    // Player with Exit Gate
    if (this.exitGate) {
      this.physics.add.overlap(this.player, this.exitGate, () => {
        this.handleLevelVictory();
      });
    }

    // Boss Collisions (Level 10)
    if (this.bossSprite) {
      this.physics.add.collider(this.bossSprite, this.platforms);

      this.physics.add.overlap(this.player, this.bossSprite, () => {
        this.handleBossEncounter();
      });

      // Boss Shockwaves & Projectiles
      this.physics.add.overlap(this.player, this.bossShockwaves, (_p, wave) => {
        (wave as Phaser.GameObjects.GameObject).destroy();
        this.takeDamage();
      });

      this.physics.add.overlap(this.player, this.bossProjectiles, (_p, proj) => {
        (proj as Phaser.GameObjects.GameObject).destroy();
        this.takeDamage();
      });
    }
  }

  private handleCrateCollision(_player: Phaser.GameObjects.GameObject, crate: Phaser.Physics.Arcade.Sprite): void {
    if (!crate || !crate.active || !this.player || !this.player.body) return;
    const isSpent = crate.getData('spent');
    const playerBottom = this.player.body.bottom ?? 0;
    const crateBottom = crate.body ? crate.body.bottom : crate.y + 8;

    if (!isSpent && this.player.body.blocked.up && playerBottom > crateBottom) {
      crate.setData('spent', true);
      crate.setTexture('crate-empty');
      soundManager.playCrateHit();

      this.tweens.add({
        targets: crate,
        y: crate.y - 6,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeOut',
      });

      const reward = crate.getData('reward');
      if (reward === 'heart') {
        const heart = this.physics.add.sprite(crate.x, crate.y - 12, 'heart-item');
        heart.setVelocityY(-160);
        this.physics.add.collider(heart, this.platforms);

        this.time.delayedCall(120, () => {
          if (!this.sys || !this.scene.isActive() || !this.player || !heart || !heart.active) return;
          this.physics.add.overlap(this.player, heart, () => {
            if (!heart.active) return;
            heart.destroy();
            this.health = Math.min(this.maxHealth, this.health + 1);
            this.callbacks.onHealthChange?.(this.health, this.maxHealth, this.lives);
            soundManager.playCrystal();
          });
        });
      } else {
        this.score += 150;
        this.crystalsCollected += 1;
        this.callbacks.onScoreChange?.(this.score);
        this.callbacks.onCrystalCollect?.(this.crystalsCollected, this.score);
        soundManager.playCrystal();

        const popCrystal = this.add.sprite(crate.x, crate.y - 16, 'crystal');
        popCrystal.play('crystal-shine');
        this.tweens.add({
          targets: popCrystal,
          y: crate.y - 36,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            if (popCrystal && popCrystal.active) popCrystal.destroy();
          },
        });
      }
    }
  }

  private handleSpringBounce(spring: Phaser.Physics.Arcade.Sprite): void {
    if (this.player && this.player.body && this.player.body.velocity.y >= 0) {
      this.player.setVelocityY(-490);
      soundManager.playSpring();
      spring.setTexture('spring-bounce');
      this.time.delayedCall(240, () => {
        if (spring && spring.active) {
          spring.setTexture('spring-idle');
        }
      });
    }
  }

  private handleCrystalCollect(crystal: Phaser.Physics.Arcade.Sprite): void {
    if (!crystal || !crystal.active) return;
    crystal.disableBody(true, true);
    soundManager.playCrystal();

    this.score += 100;
    this.crystalsCollected++;
    this.callbacks.onScoreChange?.(this.score);
    this.callbacks.onCrystalCollect?.(this.crystalsCollected, this.score);

    try {
      const emitter = this.add.particles(crystal.x, crystal.y, 'particle-sparkle', {
        speed: { min: 20, max: 60 },
        scale: { start: 1, end: 0 },
        lifespan: 300,
        quantity: 6,
      });
      this.time.delayedCall(320, () => {
        if (emitter && emitter.active) emitter.destroy();
      });
    } catch {
      // Fallback
    }
  }

  private handleEnemyEncounter(enemy: Phaser.Physics.Arcade.Sprite): void {
    if (this.isDead || this.isLevelComplete) return;
    if (!enemy || !enemy.active || enemy.getData('isSquashed')) return;
    if (!this.player || !this.player.body || !enemy.body) return;

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;

    const isFallingOnTop = playerBody.velocity.y > 0 && playerBody.bottom <= enemyBody.top + 10;

    if (isFallingOnTop) {
      enemy.setData('isSquashed', true);
      enemy.setVelocityX(0);
      soundManager.playEnemyStomp();

      if (enemy.texture.key === 'slime') {
        enemy.setFrame(3);
      } else {
        enemy.setFrame(4);
      }

      this.player.setVelocityY(-310);
      this.score += 200;
      this.callbacks.onScoreChange?.(this.score);

      this.tweens.add({
        targets: enemy,
        alpha: 0,
        y: enemy.y + 4,
        duration: 350,
        onComplete: () => {
          if (enemy && enemy.active) enemy.destroy();
        },
      });
    } else if (this.isAttacking) {
      enemy.setData('isSquashed', true);
      soundManager.playEnemyStomp();
      this.score += 200;
      this.callbacks.onScoreChange?.(this.score);

      this.tweens.add({
        targets: enemy,
        alpha: 0,
        y: enemy.y - 20,
        rotation: 1.5,
        duration: 300,
        onComplete: () => {
          if (enemy && enemy.active) enemy.destroy();
        },
      });
    } else if (!this.isInvulnerable) {
      this.takeDamage();
    }
  }

  // --- Boss Battle Logic (Level 10) ---

  private handleBossEncounter(): void {
    if (!this.bossSprite || !this.bossSprite.active || this.isDead || this.isLevelComplete) return;
    if (this.bossActionPhase === 'defeated') return;

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const bossBody = this.bossSprite.body as Phaser.Physics.Arcade.Body;

    // Check if player stomps Gorgath's head from above
    const isStompOnHead = playerBody.velocity.y > 0 && playerBody.bottom <= bossBody.top + 14;

    if (isStompOnHead || (this.isAttacking && this.isBossStunned)) {
      this.damageBoss();
      this.player.setVelocityY(-340);
    } else if (!this.isInvulnerable) {
      this.takeDamage();
    }
  }

  private damageBoss(): void {
    if (!this.bossSprite || this.bossActionPhase === 'defeated') return;

    this.bossHealth--;
    this.score += 500;
    this.callbacks.onScoreChange?.(this.score);
    soundManager.playBossHit();

    // Camera shake
    this.cameras.main.shake(200, 0.015);

    // Update Boss HUD
    this.callbacks.onBossStateUpdate?.({
      name: 'Gorgath, Crystal Colossus',
      health: Math.max(0, this.bossHealth),
      maxHealth: this.MAX_BOSS_HEALTH,
      active: true,
    });

    if (this.bossHealth <= 0) {
      this.defeatBoss();
    } else {
      // Boss flashes and recovers
      this.bossActionPhase = 'walk';
      this.isBossStunned = false;
      this.bossSprite.play('boss-walk');
      this.bossStateTimer = 0;

      // Spawn quick slime minion
      const slimeX = this.bossSprite.x > 400 ? 160 : 700;
      this.createSlime(slimeX, 230, slimeX - 50, slimeX + 50);

      // Flashing invulnerability on boss
      this.tweens.add({
        targets: this.bossSprite,
        alpha: 0.3,
        yoyo: true,
        repeat: 4,
        duration: 100,
        onComplete: () => {
          if (this.bossSprite && this.bossSprite.active) {
            this.bossSprite.setAlpha(1);
          }
        },
      });
    }
  }

  private defeatBoss(): void {
    if (!this.bossSprite) return;
    this.bossActionPhase = 'defeated';
    this.bossSprite.setVelocity(0, 0);
    this.bossSprite.play('boss-defeated');
    soundManager.playBossDefeat();

    this.callbacks.onBossStateUpdate?.({
      name: 'Gorgath, Crystal Colossus',
      health: 0,
      maxHealth: this.MAX_BOSS_HEALTH,
      active: false,
    });

    // Massive crystal explosion from boss!
    for (let c = 0; c < 8; c++) {
      const cx = this.bossSprite.x + Phaser.Math.Between(-30, 30);
      const cy = this.bossSprite.y + Phaser.Math.Between(-20, 20);
      this.createCrystal(cx, cy);
    }

    this.tweens.add({
      targets: this.bossSprite,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 1200,
      onComplete: () => {
        if (this.bossSprite) this.bossSprite.destroy();
        this.time.delayedCall(600, () => {
          this.handleLevelVictory(true);
        });
      },
    });
  }

  private updateBossAI(delta: number): void {
    if (!this.bossSprite || !this.bossSprite.active || this.bossActionPhase === 'defeated') return;

    this.bossStateTimer += delta;

    if (this.bossActionPhase === 'walk') {
      const walkSpeed = 50 + (this.MAX_BOSS_HEALTH - this.bossHealth) * 10;
      this.bossSprite.setVelocityX(this.bossMoveDir * walkSpeed);
      this.bossSprite.setFlipX(this.bossMoveDir < 0);

      if (this.bossSprite.x <= 140) {
        this.bossMoveDir = 1;
      } else if (this.bossSprite.x >= this.levelWidth - 140) {
        this.bossMoveDir = -1;
      }

      // Every 3.8 seconds: initiate Ground Pound Attack
      if (this.bossStateTimer > 3800) {
        this.bossActionPhase = 'slam';
        this.bossStateTimer = 0;
        this.bossSprite.setVelocityX(0);
        this.bossSprite.play('boss-slam');

        // Execute slam impact after windup
        this.time.delayedCall(700, () => {
          if (!this.bossSprite || this.bossActionPhase === 'defeated') return;

          soundManager.playShockwave();
          this.cameras.main.shake(250, 0.02);

          // Shoot shockwaves along floor left and right
          const waveL = this.bossShockwaves.create(this.bossSprite.x - 20, 252, 'boss-shockwave');
          waveL.setVelocityX(-160);
          const waveR = this.bossShockwaves.create(this.bossSprite.x + 20, 252, 'boss-shockwave');
          waveR.setVelocityX(160);
          waveR.setFlipX(true);

          // Falling crystal shard from ceiling aiming near player
          const shardX = Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-30, 30), 80, this.levelWidth - 80);
          const shard = this.bossProjectiles.create(shardX, 20, 'projectile-shard');
          shard.setVelocityY(180);

          // After slam, boss becomes STUNNED and vulnerable!
          this.time.delayedCall(600, () => {
            if (!this.bossSprite || this.bossActionPhase === 'defeated') return;
            this.bossActionPhase = 'stunned';
            this.isBossStunned = true;
            this.bossStateTimer = 0;
            this.bossSprite.play('boss-stunned');
          });
        });
      }
    } else if (this.bossActionPhase === 'stunned') {
      this.bossSprite.setVelocityX(0);

      // Stunned for 2.6 seconds
      if (this.bossStateTimer > 2600) {
        this.bossActionPhase = 'walk';
        this.isBossStunned = false;
        this.bossStateTimer = 0;
        this.bossSprite.play('boss-walk');
        // Jump direction towards player
        this.bossMoveDir = this.player.x < this.bossSprite.x ? -1 : 1;
      }
    }
  }

  private takeDamage(): void {
    if (this.isInvulnerable || this.isDead || !this.player || !this.player.active) return;

    this.health--;
    soundManager.playHurt();
    this.callbacks.onHealthChange?.(this.health, this.maxHealth, this.lives);
    this.callbacks.onPlayerHurt?.();

    if (this.health <= 0) {
      this.handlePlayerDeath();
      return;
    }

    this.isInvulnerable = true;
    this.player.setVelocityX(this.player.flipX ? 140 : -140);
    this.player.setVelocityY(-180);

    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      yoyo: true,
      repeat: 6,
      duration: 120,
      onComplete: () => {
        if (this.player && this.player.active) {
          this.player.setAlpha(1);
        }
        this.isInvulnerable = false;
      },
    });
  }

  private handlePlayerDeath(): void {
    if (this.isDead || !this.player) return;
    this.isDead = true;
    this.lives--;
    soundManager.playGameOver();
    this.callbacks.onHealthChange?.(0, this.maxHealth, this.lives);
    this.callbacks.onPlayerDeath?.(this.lives);

    if (this.player.body) {
      this.player.setVelocity(0, -260);
      this.player.setCollideWorldBounds(false);
    }
    this.player.play('pip-hurt');

    if (this.lives <= 0) {
      this.time.delayedCall(1200, () => {
        if (!this.sys || !this.scene.isActive()) return;
        soundManager.stopBGM();
        this.callbacks.onGameOver?.(this.score, this.crystalsCollected);
      });
    } else {
      this.time.delayedCall(1200, () => {
        if (!this.sys || !this.scene.isActive()) return;
        this.respawnPlayer();
      });
    }
  }

  private respawnPlayer(): void {
    if (!this.player || !this.player.active) return;
    this.isDead = false;
    this.health = this.maxHealth;
    this.player.setCollideWorldBounds(true);
    this.player.setPosition(this.respawnX, this.respawnY);
    this.player.setVelocity(0, 0);
    this.player.setAlpha(1);
    this.isInvulnerable = true;
    this.player.play('pip-idle');

    this.callbacks.onHealthChange?.(this.health, this.maxHealth, this.lives);

    this.tweens.add({
      targets: this.player,
      alpha: 0.4,
      yoyo: true,
      repeat: 4,
      duration: 150,
      onComplete: () => {
        if (this.player && this.player.active) {
          this.player.setAlpha(1);
        }
        this.isInvulnerable = false;
      },
    });
  }

  private handleLevelVictory(isBossDefeated: boolean = false): void {
    if (this.isLevelComplete || this.isDead || !this.player) return;
    this.isLevelComplete = true;

    soundManager.stopBGM();
    soundManager.playVictory();

    this.player.setVelocity(0, 0);
    this.player.play('pip-idle');

    const timeBonus = this.timeRemaining * 10;
    const bossBonus = isBossDefeated ? 2500 : 0;
    const finalScore = this.score + timeBonus + this.crystalsCollected * 50 + bossBonus;

    this.tweens.add({
      targets: this.player,
      y: this.player.y - 30,
      duration: 600,
      yoyo: true,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.time.delayedCall(500, () => {
          if (!this.sys || !this.scene.isActive()) return;
          this.callbacks.onLevelComplete?.({
            levelNumber: this.levelNumber,
            score: this.score,
            crystals: this.crystalsCollected,
            timeBonus,
            totalScore: finalScore,
            isNewHighScore: false,
            isGameComplete: this.levelNumber === 10,
          });
        });
      },
    });
  }

  public override update(time: number, delta: number): void {
    if (this.isDead || this.isLevelComplete || !this.player || !this.player.body) return;

    // Pull input from bridge
    const bridgeInput = phaserBridge.getInputState();
    this.inputState = { ...bridgeInput };

    const onGround = Boolean(this.player.body.blocked.down || this.player.body.touching.down);

    // Update Checkpoint along progress
    if (onGround && this.player.x > this.respawnX + 250 && this.player.x < this.levelWidth - 200) {
      this.respawnX = Math.round(this.player.x);
      this.respawnY = Math.round(this.player.y - 10);
    }

    // Pit fall check
    if (this.player.y > this.LEVEL_HEIGHT - 10) {
      this.handlePlayerDeath();
      return;
    }

    // --- Timers for Coyote Time & Jump Buffering ---
    if (onGround) {
      this.coyoteTimer = this.COYOTE_TIME;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer -= delta;
    }

    if (this.inputState.jumpJustDown) {
      this.jumpBufferTimer = this.JUMP_BUFFER_TIME;
    } else if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= delta;
    }

    // --- Attack Handling ---
    if (this.inputState.attackJustDown && !this.isAttacking) {
      this.isAttacking = true;
      soundManager.playAttack();
      this.player.play('pip-attack');

      const attackRange = 24;
      const attackX = this.player.flipX ? this.player.x - attackRange : this.player.x + attackRange;
      const attackY = this.player.y;

      // Check hits on regular enemies
      this.enemies.getChildren().forEach((child) => {
        const enemy = child as Phaser.Physics.Arcade.Sprite;
        if (enemy && enemy.active && !enemy.getData('isSquashed') && Phaser.Math.Distance.Between(attackX, attackY, enemy.x, enemy.y) < 26) {
          enemy.setData('isSquashed', true);
          soundManager.playEnemyStomp();
          this.score += 200;
          this.callbacks.onScoreChange?.(this.score);

          this.tweens.add({
            targets: enemy,
            alpha: 0,
            y: enemy.y - 20,
            rotation: 1.5,
            duration: 300,
            onComplete: () => {
              if (enemy && enemy.active) enemy.destroy();
            },
          });
        }
      });

      // Check hits on Boss (Gorgath)
      if (this.bossSprite && this.bossSprite.active && Phaser.Math.Distance.Between(attackX, attackY, this.bossSprite.x, this.bossSprite.y) < 40) {
        if (this.isBossStunned) {
          this.damageBoss();
        } else {
          // Deflected by stone armor!
          soundManager.playCrateHit();
          this.player.setVelocityX(this.player.flipX ? 120 : -120);
        }
      }

      this.time.delayedCall(260, () => {
        this.isAttacking = false;
      });
    }

    // --- Horizontal Movement & Speed ---
    const baseSpeed = this.inputState.sprint ? 240 : 160;
    let targetVx = 0;

    if (this.inputState.left) {
      targetVx = -baseSpeed;
      this.player.setFlipX(true);
    } else if (this.inputState.right) {
      targetVx = baseSpeed;
      this.player.setFlipX(false);
    }

    this.player.setVelocityX(targetVx);

    // --- Variable Jump Physics ---
    const canJump = onGround || this.coyoteTimer > 0;

    if (this.jumpBufferTimer > 0 && canJump && !this.isJumping) {
      this.isJumping = true;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.jumpHoldTimer = 0;
      this.player.setVelocityY(-300);
      soundManager.playJump();
    }

    if (this.isJumping) {
      if (this.inputState.jump && this.jumpHoldTimer < this.MAX_JUMP_HOLD_TIME) {
        this.jumpHoldTimer += delta;
        const curVy = this.player.body.velocity.y;
        this.player.setVelocityY(curVy - 5);
      } else {
        this.isJumping = false;
        if (this.player.body.velocity.y < -120) {
          this.player.setVelocityY(this.player.body.velocity.y * 0.55);
        }
      }
    }

    if (onGround && this.player.body.velocity.y >= 0) {
      this.isJumping = false;
    }

    // --- Animation State Machine ---
    if (!this.isAttacking) {
      if (this.isInvulnerable) {
        this.player.play('pip-hurt', true);
      } else if (!onGround) {
        if (this.player.body.velocity.y < -20) {
          this.player.play('pip-jump', true);
        } else {
          this.player.play('pip-fall', true);
        }
      } else if (Math.abs(this.player.body.velocity.x) > 10) {
        if (this.inputState.sprint) {
          this.player.play('pip-run', true);
        } else {
          this.player.play('pip-walk', true);
        }
      } else {
        this.player.play('pip-idle', true);
      }
    }

    // --- Update Patrol Enemies ---
    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      if (!enemy || !enemy.active || enemy.getData('isSquashed')) return;

      const minX = enemy.getData('minX');
      const maxX = enemy.getData('maxX');
      const speed = enemy.getData('speed');
      let dir = enemy.getData('direction');

      if (enemy.x <= minX) {
        dir = 1;
        enemy.setData('direction', 1);
        enemy.setVelocityX(speed);
        enemy.setFlipX(false);
      } else if (enemy.x >= maxX) {
        dir = -1;
        enemy.setData('direction', -1);
        enemy.setVelocityX(-speed);
        enemy.setFlipX(true);
      } else {
        enemy.setVelocityX(dir * speed);
      }
    });

    // --- Update Moving Platforms ---
    this.movingPlatforms.forEach((mp) => {
      if (!mp.sprite || !mp.sprite.active) return;
      if (mp.axis === 'x') {
        if (mp.sprite.x <= mp.min) {
          mp.sprite.setVelocityX(mp.speed);
        } else if (mp.sprite.x >= mp.max) {
          mp.sprite.setVelocityX(-mp.speed);
        } else if (mp.sprite.body && mp.sprite.body.velocity.x === 0) {
          mp.sprite.setVelocityX(mp.speed);
        }
      } else {
        if (mp.sprite.y <= mp.min) {
          mp.sprite.setVelocityY(mp.speed);
        } else if (mp.sprite.y >= mp.max) {
          mp.sprite.setVelocityY(-mp.speed);
        } else if (mp.sprite.body && mp.sprite.body.velocity.y === 0) {
          mp.sprite.setVelocityY(mp.speed);
        }
      }
    });

    // --- Update Boss AI (Level 10) ---
    if (this.isBossActive) {
      this.updateBossAI(delta);
    }

    // Clear single-frame triggers
    phaserBridge.clearJustDown();
  }
}
