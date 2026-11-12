/**
 * GreenfieldScene - World 1-1: Greenfield Crossing
 * Core Phaser 3 Arcade Physics Scene for Tiny Trails: Crystal Run.
 */

import Phaser from 'phaser';
import { InputState, GameEventCallbacks } from '../types';
import { PixelAssetGenerator } from '../graphics/PixelAssetGenerator';
import { soundManager } from '../audio/SoundManager';
import { phaserBridge } from '../PhaserGameBridge';

export class GreenfieldScene extends Phaser.Scene {
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
  private mysteryCrates!: Phaser.Physics.Arcade.StaticGroup;
  private crystals!: Phaser.Physics.Arcade.Group;
  private springs!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private exitGate!: Phaser.Physics.Arcade.Sprite;

  // Background parallax layers
  private bgClouds: Phaser.GameObjects.Image[] = [];
  private bgHills: Phaser.GameObjects.Image[] = [];
  private bgMountains: Phaser.GameObjects.Image[] = [];

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
  private readonly LEVEL_WIDTH: number = 2500;
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

  public init(data: { callbacks?: Partial<GameEventCallbacks> }) {
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
    // Generate procedural pixel-art assets
    PixelAssetGenerator.generateAll(this);
  }

  public create(): void {
    this.isDead = false;
    this.isLevelComplete = false;
    this.isInvulnerable = false;
    this.isAttacking = false;
    this.isJumping = false;
    this.score = 0;
    this.crystalsCollected = 0;
    this.health = 3;
    this.lives = 3;
    this.timeRemaining = 300;
    this.respawnX = 60;
    this.respawnY = 220;

    // Reset parallax arrays
    this.bgClouds = [];
    this.bgHills = [];
    this.bgMountains = [];

    // Ensure callbacks are populated
    if (Object.keys(this.callbacks).length === 0) {
      this.callbacks = phaserBridge.getCallbacks();
    }

    // Set world physics bounds
    this.physics.world.setBounds(0, 0, this.LEVEL_WIDTH, this.LEVEL_HEIGHT);
    this.physics.world.gravity.y = 850;

    // Create Animations
    this.createAnimations();

    // Create Parallax Backgrounds
    this.createBackgrounds();

    // Create Groups
    this.platforms = this.physics.add.staticGroup();
    this.mysteryCrates = this.physics.add.staticGroup();
    this.springs = this.physics.add.staticGroup();
    this.crystals = this.physics.add.group({ allowGravity: false });
    this.enemies = this.physics.add.group();

    // Build the Greenfield Crossing Level Layout
    this.buildLevelLayout();

    // Create Player (Pip)
    this.createPlayer();

    // Setup Collisions
    this.setupCollisions();

    // Setup Camera
    this.cameras.main.setBounds(0, 0, this.LEVEL_WIDTH, this.LEVEL_HEIGHT);
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

    // Start background melody
    soundManager.startBGM();
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
  }

  private createBackgrounds(): void {
    // Soft sky gradient backdrop
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x38bdf8, 0x38bdf8, 0xbae6fd, 0xbae6fd, 1);
    sky.fillRect(0, 0, this.LEVEL_WIDTH, this.LEVEL_HEIGHT);
    sky.setScrollFactor(0);

    // Distant Mountains (parallax 0.15)
    for (let x = 0; x < this.LEVEL_WIDTH + 300; x += 180) {
      const mtn = this.add.image(x, 220, 'bg-mountain');
      mtn.setOrigin(0.5, 1);
      mtn.setScrollFactor(0.15);
      mtn.setAlpha(0.65);
      this.bgMountains.push(mtn);
    }

    // Rolling Green Hills (parallax 0.35)
    for (let x = 0; x < this.LEVEL_WIDTH + 200; x += 120) {
      const hill = this.add.image(x, 280, 'bg-hill');
      hill.setOrigin(0.5, 1);
      hill.setScrollFactor(0.35);
      this.bgHills.push(hill);
    }

    // Clouds (parallax 0.25)
    for (let i = 0; i < 18; i++) {
      const cx = Phaser.Math.Between(40, this.LEVEL_WIDTH);
      const cy = Phaser.Math.Between(20, 110);
      const cloud = this.add.image(cx, cy, 'bg-cloud');
      cloud.setScrollFactor(0.25);
      cloud.setScale(Phaser.Math.FloatBetween(0.8, 1.3));
      this.bgClouds.push(cloud);
    }
  }

  private createPlayer(): void {
    this.player = this.physics.add.sprite(this.respawnX, this.respawnY, 'pip', 0);
    this.player.setCollideWorldBounds(true);
    // Custom tight hit box for responsive platforming
    this.player.body?.setSize(12, 18);
    this.player.body?.setOffset(6, 6);
    this.player.play('pip-idle');
  }

  /**
   * Builds the Greenfield Crossing level layout
   */
  private buildLevelLayout(): void {
    // 1. Solid Ground Segments with pits in between
    this.createGroundSegment(0, 520, 270);
    this.createGroundSegment(580, 1050, 270);
    this.createGroundSegment(1120, 1680, 270);
    this.createGroundSegment(1740, 2500, 270);

    // 2. Elevated Platforms & Stepping Stones
    this.createPlatform(160, 220, 4);
    this.createCrystal(184, 195);
    this.createCrystal(200, 195);

    // Mystery blocks & floating platform
    this.createMysteryCrate(280, 190, 'crystal');
    this.createStoneBlock(296, 190);
    this.createMysteryCrate(312, 190, 'heart');
    this.createMysteryCrate(328, 190, 'crystal');

    // First patrol enemy
    this.createSlime(400, 250, 360, 480);

    // Floating wooden bridge over first small chasm
    this.createBridge(510, 210, 5);
    this.createCrystal(530, 180);
    this.createCrystal(550, 180);

    // Spring mushroom for big air
    this.createSpringMushroom(640, 260);
    this.createCrystal(640, 130);
    this.createCrystal(660, 110);
    this.createCrystal(680, 110);
    this.createCrystal(700, 130);

    // High secret stone ledge
    this.createPlatform(720, 160, 5);
    this.createMysteryCrate(740, 110, 'crystal');
    this.createMysteryCrate(760, 110, 'crystal');
    this.createCrystal(780, 140);

    // Beetle enemy on ground
    this.createBeetle(820, 250, 750, 950);

    // Stepping stones
    this.createPlatform(880, 210, 3);
    this.createPlatform(960, 175, 3);
    this.createCrystal(976, 150);

    // Second pit crossing with wooden bridge
    this.createBridge(1040, 200, 6);
    this.createSlime(1200, 250, 1140, 1300);

    // Checkpoint area at x: 1250
    this.add.image(1250, 245, 'tile-bush').setDepth(1);
    this.add.image(1280, 248, 'tile-flower').setDepth(1);

    // Multi-tier stone ruins
    this.createStoneBlock(1320, 210);
    this.createStoneBlock(1336, 210);
    this.createMysteryCrate(1352, 210, 'crystal');
    this.createStoneBlock(1368, 210);

    this.createPlatform(1400, 160, 4);
    this.createBeetle(1420, 145, 1400, 1464);
    this.createCrystal(1420, 120);
    this.createCrystal(1440, 120);

    // High spring mushroom
    this.createSpringMushroom(1490, 260);
    this.createCrystal(1490, 140);
    this.createCrystal(1510, 110);

    // Elevated bridge across deep hazard
    this.createBridge(1560, 180, 8);
    this.createSlime(1600, 165, 1560, 1680);
    this.createCrystal(1620, 150);

    // Final stretch
    this.createPlatform(1760, 230, 4);
    this.createPlatform(1850, 190, 4);
    this.createPlatform(1940, 150, 4);
    this.createCrystal(1960, 120);
    this.createCrystal(1980, 120);

    this.createBeetle(2050, 250, 1980, 2200);
    this.createSlime(2150, 250, 2050, 2260);

    // Flora decor
    for (let x = 60; x < this.LEVEL_WIDTH - 200; x += 140) {
      this.add.image(x, 260, 'tile-bush');
      this.add.image(x + 40, 264, 'tile-flower');
    }

    // Exit Gate (World 1-1 Goal)
    this.exitGate = this.physics.add.sprite(2380, 242, 'exit-gate');
    this.exitGate.setImmovable(true);
    if (this.exitGate.body) {
      (this.exitGate.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      this.exitGate.body.setSize(28, 44);
    }

    // Magical glowing pulse on the exit gate
    this.tweens.add({
      targets: this.exitGate,
      alpha: { from: 0.85, to: 1.0 },
      yoyo: true,
      repeat: -1,
      duration: 700,
    });
  }

  private createGroundSegment(startX: number, endX: number, surfaceY: number): void {
    const tileW = 16;
    for (let x = startX; x <= endX; x += tileW) {
      const topTile = this.platforms.create(x + tileW / 2, surfaceY + tileW / 2, 'tile-grass-top');
      topTile.refreshBody();

      for (let y = surfaceY + tileW; y < this.LEVEL_HEIGHT; y += tileW) {
        this.add.image(x + tileW / 2, y + tileW / 2, 'tile-dirt');
      }
    }
  }

  private createPlatform(startX: number, surfaceY: number, widthInTiles: number): void {
    const tileW = 16;
    for (let i = 0; i < widthInTiles; i++) {
      const x = startX + i * tileW + tileW / 2;
      const y = surfaceY + tileW / 2;
      const tile = this.platforms.create(x, y, 'tile-grass-top');
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
    this.physics.add.overlap(this.player, this.exitGate, () => {
      this.handleLevelVictory();
    });
  }

  private handleCrateCollision(_player: Phaser.GameObjects.GameObject, crate: Phaser.Physics.Arcade.Sprite): void {
    if (!crate || !crate.active || !this.player || !this.player.body) return;
    const isSpent = crate.getData('spent');
    const playerBottom = this.player.body.bottom ?? 0;
    const crateBottom = crate.body ? crate.body.bottom : crate.y + 8;

    // Hit from below
    if (!isSpent && this.player.body.blocked.up && playerBottom > crateBottom) {
      crate.setData('spent', true);
      crate.setTexture('crate-empty');
      soundManager.playCrateHit();

      // Bounce crate animation
      this.tweens.add({
        targets: crate,
        y: crate.y - 6,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeOut',
      });

      // Spawn reward
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
        // Crystal reward
        this.score += 150;
        this.crystalsCollected += 1;
        this.callbacks.onScoreChange?.(this.score);
        this.callbacks.onCrystalCollect?.(this.crystalsCollected, this.score);
        soundManager.playCrystal();

        // Little celebratory pop crystal
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

    // Particle burst
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
      // Fallback if particle emitter unsupported
    }
  }

  private handleEnemyEncounter(enemy: Phaser.Physics.Arcade.Sprite): void {
    if (this.isDead || this.isLevelComplete) return;
    if (!enemy || !enemy.active || enemy.getData('isSquashed')) return;
    if (!this.player || !this.player.body || !enemy.body) return;

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;

    // Check if player jumped on top of enemy (Stomp!)
    const isFallingOnTop = playerBody.velocity.y > 0 && playerBody.bottom <= enemyBody.top + 10;

    if (isFallingOnTop) {
      // Enemy defeated by jump stomp
      enemy.setData('isSquashed', true);
      enemy.setVelocityX(0);
      soundManager.playEnemyStomp();

      if (enemy.texture.key === 'slime') {
        enemy.setFrame(3);
      } else {
        enemy.setFrame(4);
      }

      // Bounce player upward
      this.player.setVelocityY(-310);
      this.score += 200;
      this.callbacks.onScoreChange?.(this.score);

      // Fade and destroy enemy
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
      // Staff attack defeats enemy
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
      // Player takes damage!
      this.takeDamage();
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

    // Invulnerability flashing & knockback
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
      // Game Over
      this.time.delayedCall(1200, () => {
        if (!this.sys || !this.scene.isActive()) return;
        soundManager.stopBGM();
        this.callbacks.onGameOver?.(this.score, this.crystalsCollected);
      });
    } else {
      // Respawn after short delay
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

    // Safe respawn shield
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

  private handleLevelVictory(): void {
    if (this.isLevelComplete || this.isDead || !this.player) return;
    this.isLevelComplete = true;

    soundManager.stopBGM();
    soundManager.playVictory();

    this.player.setVelocity(0, 0);
    this.player.play('pip-idle');

    // Time bonus: 10 points per remaining second
    const timeBonus = this.timeRemaining * 10;
    const finalScore = this.score + timeBonus + this.crystalsCollected * 50;

    // Victory celebration spin
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
            score: this.score,
            crystals: this.crystalsCollected,
            timeBonus,
            totalScore: finalScore,
            isNewHighScore: false,
          });
        });
      },
    });
  }

  public override update(time: number, delta: number): void {
    if (this.isDead || this.isLevelComplete || !this.player || !this.player.body) return;

    // Pull input from bridge to ensure unified sync
    const bridgeInput = phaserBridge.getInputState();
    this.inputState = { ...bridgeInput };

    const onGround = Boolean(this.player.body.blocked.down || this.player.body.touching.down);

    // Update Checkpoint along progress
    if (onGround && this.player.x > this.respawnX + 250 && this.player.x < 2200) {
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

      // Staff attack hitbox range
      const attackRange = 24;
      const attackX = this.player.flipX ? this.player.x - attackRange : this.player.x + attackRange;
      const attackY = this.player.y;

      // Check hits on enemies
      this.enemies.getChildren().forEach((child) => {
        const enemy = child as Phaser.Physics.Arcade.Sprite;
        if (enemy && enemy.active && !enemy.getData('isSquashed') && Phaser.Math.Distance.Between(attackX, attackY, enemy.x, enemy.y) < 24) {
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

    // --- Variable Jump Physics (Celeste / Mario feel) ---
    const canJump = onGround || this.coyoteTimer > 0;

    if (this.jumpBufferTimer > 0 && canJump && !this.isJumping) {
      this.isJumping = true;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.jumpHoldTimer = 0;
      this.player.setVelocityY(-300);
      soundManager.playJump();
    }

    // Variable jump height hold
    if (this.isJumping) {
      if (this.inputState.jump && this.jumpHoldTimer < this.MAX_JUMP_HOLD_TIME) {
        this.jumpHoldTimer += delta;
        const curVy = this.player.body.velocity.y;
        this.player.setVelocityY(curVy - 5);
      } else {
        // Button released or max duration reached: terminate variable boost
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

    // Clear single-frame triggers
    phaserBridge.clearJustDown();
  }
}
