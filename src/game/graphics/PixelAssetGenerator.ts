/**
 * PixelAssetGenerator
 * Generates rich, authentic pixel-art sprite textures and tiles for Tiny Trails: Crystal Run.
 * Designed to be modular so external sprite sheets (e.g. from sprite-gen) can replace
 * textures without modifying scene logic.
 */

import Phaser from 'phaser';

export class PixelAssetGenerator {
  public static generateAll(scene: Phaser.Scene): void {
    this.createPlayerSpritesheet(scene);
    this.createSlimeSpritesheet(scene);
    this.createBeetleSpritesheet(scene);
    this.createCrystalSpritesheet(scene);
    this.createCrateTextures(scene);
    this.createMushroomTextures(scene);
    this.createHeartTexture(scene);
    this.createEnvironmentTiles(scene);
    this.createExitGateTexture(scene);
    this.createParticleTextures(scene);
    this.createCavernAndHazardTiles(scene);
    this.createBossTextures(scene);
    this.createWaterTextures(scene);
  }

  /**
   * Helper to create a canvas and return 2D context with pixelated crispness
   */
  private static createCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  /**
   * Pip: Small fantasy explorer
   * Features: Blue scarf, small brown leather backpack, green tunic, brown boots, explorer feathered cap.
   * Total 24 frames across 8 animations:
   * Frames:
   * 0..3: Idle (4 frames)
   * 4..7: Walk (4 frames)
   * 8..11: Run (4 frames)
   * 12..13: Jump (2 frames)
   * 14..15: Fall (2 frames)
   * 16..17: Land (2 frames)
   * 18..21: Attack (4 frames)
   * 22..23: Hurt (2 frames)
   */
  private static createPlayerSpritesheet(scene: Phaser.Scene): void {
    if (scene.textures.exists('pip')) return;

    const frameW = 24;
    const frameH = 24;
    const totalFrames = 24;
    const { canvas, ctx } = this.createCanvas(frameW * totalFrames, frameH);

    // Color Palette
    const c = {
      skin: '#fbd38d',
      skinShadow: '#ed8936',
      eye: '#1a202c',
      eyeWhite: '#ffffff',
      hair: '#744210',
      hat: '#22543d',
      hatBrim: '#1c4532',
      feather: '#e53e3e',
      scarf: '#38bdf8',
      scarfShade: '#0284c7',
      scarfHighlight: '#bae6fd',
      tunic: '#2f855a',
      tunicShadow: '#22543d',
      belt: '#975a16',
      buckle: '#ecc94b',
      backpack: '#b7791f',
      backpackPocket: '#975a16',
      pants: '#4a5568',
      boots: '#2d3748',
      staff: '#975a16',
      crystalGlow: '#67e8f9',
      spark: '#ffffff',
    };

    for (let f = 0; f < totalFrames; f++) {
      const ox = f * frameW;
      const oy = 0;

      // Draw background transparency
      ctx.clearRect(ox, oy, frameW, frameH);

      // Determine animation context
      let bob = 0;
      let legOffset = 0;
      let scarfFlutter = 0;
      let isJumping = false;
      let isFalling = false;
      let isLanding = false;
      let isAttacking = false;
      let isHurt = false;
      let attackFrame = 0;

      if (f < 4) {
        // Idle
        bob = f === 1 || f === 2 ? 1 : 0;
        scarfFlutter = f % 2;
      } else if (f < 8) {
        // Walk
        const step = f - 4;
        bob = step === 1 || step === 3 ? 1 : 0;
        legOffset = step === 0 ? -2 : step === 2 ? 2 : 0;
        scarfFlutter = (step % 2) * 2;
      } else if (f < 12) {
        // Run
        const rStep = f - 8;
        bob = rStep === 1 || rStep === 3 ? 1 : -1;
        legOffset = rStep === 0 ? -3 : rStep === 2 ? 3 : 0;
        scarfFlutter = 2 + (rStep % 2) * 2;
      } else if (f < 14) {
        // Jump
        isJumping = true;
        bob = -2;
        scarfFlutter = 3;
      } else if (f < 16) {
        // Fall
        isFalling = true;
        bob = 0;
        scarfFlutter = 1;
      } else if (f < 18) {
        // Land
        isLanding = true;
        bob = 2;
      } else if (f < 22) {
        // Attack
        isAttacking = true;
        attackFrame = f - 18;
      } else {
        // Hurt
        isHurt = true;
        bob = (f - 22) * 2;
      }

      // --- 1. Backpack (Behind body, slightly to the left) ---
      if (!isHurt) {
        ctx.fillStyle = c.backpack;
        ctx.fillRect(ox + 5, oy + 9 + bob, 4, 6);
        ctx.fillStyle = c.backpackPocket;
        ctx.fillRect(ox + 5, oy + 12 + bob, 4, 2);
      }

      // --- 2. Legs / Boots ---
      ctx.fillStyle = c.pants;
      if (isJumping) {
        ctx.fillRect(ox + 9, oy + 17 + bob, 3, 2);
        ctx.fillRect(ox + 13, oy + 16 + bob, 3, 2);
        ctx.fillStyle = c.boots;
        ctx.fillRect(ox + 9, oy + 19 + bob, 3, 2);
        ctx.fillRect(ox + 13, oy + 18 + bob, 3, 2);
      } else if (isLanding) {
        ctx.fillRect(ox + 7, oy + 18 + bob, 4, 2);
        ctx.fillRect(ox + 14, oy + 18 + bob, 4, 2);
        ctx.fillStyle = c.boots;
        ctx.fillRect(ox + 6, oy + 20 + bob, 5, 2);
        ctx.fillRect(ox + 14, oy + 20 + bob, 5, 2);
      } else {
        // Standing / Walking / Running legs
        const l1 = Math.max(-2, Math.min(2, legOffset));
        const l2 = -l1;
        ctx.fillRect(ox + 9 + l1, oy + 17 + bob, 3, 3);
        ctx.fillRect(ox + 13 + l2, oy + 17 + bob, 3, 3);

        ctx.fillStyle = c.boots;
        ctx.fillRect(ox + 8 + l1, oy + 20 + bob, 4, 3);
        ctx.fillRect(ox + 13 + l2, oy + 20 + bob, 4, 3);
      }

      // --- 3. Torso / Tunic ---
      ctx.fillStyle = isHurt ? '#fc8181' : c.tunic;
      ctx.fillRect(ox + 8, oy + 10 + bob, 8, 7);

      // Belt & Buckle
      ctx.fillStyle = c.belt;
      ctx.fillRect(ox + 8, oy + 15 + bob, 8, 2);
      ctx.fillStyle = c.buckle;
      ctx.fillRect(ox + 11, oy + 15 + bob, 2, 2);

      // --- 4. Blue Scarf (Iconic feature of Pip!) ---
      ctx.fillStyle = isHurt ? '#e2e8f0' : c.scarf;
      // Neck wrap
      ctx.fillRect(ox + 7, oy + 9 + bob, 10, 3);
      ctx.fillStyle = isHurt ? '#cbd5e1' : c.scarfShade;
      ctx.fillRect(ox + 8, oy + 11 + bob, 8, 1);

      // Trailing scarf tail (flutters behind)
      ctx.fillStyle = isHurt ? '#e2e8f0' : c.scarf;
      const tailX = ox + 4 - scarfFlutter;
      const tailY = oy + 10 + bob + (scarfFlutter % 2);
      ctx.fillRect(tailX, tailY, 4, 3);
      ctx.fillStyle = c.scarfHighlight;
      ctx.fillRect(tailX + 1, tailY + 1, 2, 1);

      // --- 5. Head / Face ---
      ctx.fillStyle = isHurt ? '#feb2b2' : c.skin;
      ctx.fillRect(ox + 8, oy + 4 + bob, 9, 6);

      // Hair
      ctx.fillStyle = c.hair;
      ctx.fillRect(ox + 7, oy + 5 + bob, 3, 5);
      ctx.fillRect(ox + 9, oy + 4 + bob, 2, 2);

      // Eyes
      if (isHurt) {
        // X eyes when hurt
        ctx.fillStyle = '#742a2a';
        ctx.fillRect(ox + 13, oy + 6 + bob, 1, 1);
        ctx.fillRect(ox + 15, oy + 6 + bob, 1, 1);
      } else {
        // Bright explorer eyes
        ctx.fillStyle = c.eyeWhite;
        ctx.fillRect(ox + 12, oy + 6 + bob, 2, 2);
        ctx.fillRect(ox + 15, oy + 6 + bob, 2, 2);
        ctx.fillStyle = c.eye;
        ctx.fillRect(ox + 13, oy + 6 + bob, 1, 2);
        ctx.fillRect(ox + 16, oy + 6 + bob, 1, 2);
      }

      // Cheeks
      ctx.fillStyle = '#f6ad55';
      ctx.fillRect(ox + 11, oy + 8 + bob, 1, 1);
      ctx.fillRect(ox + 16, oy + 8 + bob, 1, 1);

      // --- 6. Explorer Cap & Feather ---
      ctx.fillStyle = c.hat;
      ctx.fillRect(ox + 7, oy + 1 + bob, 10, 4);
      ctx.fillStyle = c.hatBrim;
      ctx.fillRect(ox + 6, oy + 4 + bob, 12, 2);

      // Red Explorer Feather
      ctx.fillStyle = c.feather;
      ctx.fillRect(ox + 6, oy + 0 + bob, 2, 3);
      ctx.fillRect(ox + 7, oy - 1 + bob, 1, 2);

      // --- 7. Staff & Attack Arc ---
      if (isAttacking) {
        ctx.fillStyle = c.staff;
        if (attackFrame === 0) {
          // Raising staff
          ctx.fillRect(ox + 15, oy + 6 + bob, 2, 10);
          ctx.fillStyle = c.crystalGlow;
          ctx.fillRect(ox + 14, oy + 4 + bob, 4, 3);
        } else if (attackFrame === 1 || attackFrame === 2) {
          // Swing forward with blue crystal slash arc
          ctx.fillRect(ox + 16, oy + 12 + bob, 6, 2);
          ctx.fillStyle = c.crystalGlow;
          ctx.fillRect(ox + 21, oy + 11 + bob, 3, 4);

          // Energy wave arc
          ctx.fillStyle = '#a5f3fc';
          ctx.fillRect(ox + 20, oy + 6 + bob, 2, 3);
          ctx.fillRect(ox + 22, oy + 9 + bob, 2, 7);
          ctx.fillRect(ox + 20, oy + 16 + bob, 2, 3);

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(ox + 22, oy + 12 + bob, 2, 2);
        } else {
          // Recovery
          ctx.fillRect(ox + 16, oy + 14 + bob, 4, 2);
          ctx.fillStyle = c.crystalGlow;
          ctx.fillRect(ox + 19, oy + 13 + bob, 3, 3);
        }
      }
    }

    scene.textures.addSpriteSheet('pip', canvas as unknown as HTMLImageElement, {
      frameWidth: frameW,
      frameHeight: frameH,
    });
  }

  /**
   * Moss Slime Enemy
   * 4 frames: 0..2 walk/bounce, 3 squashed flat
   */
  private static createSlimeSpritesheet(scene: Phaser.Scene): void {
    if (scene.textures.exists('slime')) return;

    const fw = 16;
    const fh = 16;
    const { canvas, ctx } = this.createCanvas(fw * 4, fh);

    const c = {
      body: '#48bb78',
      shade: '#276749',
      highlight: '#9ae6b4',
      sprout: '#22543d',
      leaf: '#68d391',
      eyeWhite: '#ffffff',
      pupil: '#1a202c',
    };

    for (let f = 0; f < 4; f++) {
      const ox = f * fw;
      ctx.clearRect(ox, 0, fw, fh);

      if (f < 3) {
        // Pulsating bounce
        const h = f === 1 ? 10 : 8;
        const w = f === 1 ? 12 : 14;
        const x = ox + (16 - w) / 2;
        const y = 16 - h;

        // Slime body
        ctx.fillStyle = c.shade;
        ctx.fillRect(x, y + 2, w, h - 2);
        ctx.fillStyle = c.body;
        ctx.fillRect(x + 1, y, w - 2, h - 1);
        ctx.fillStyle = c.highlight;
        ctx.fillRect(x + 2, y + 1, 3, 2);

        // Eyes
        ctx.fillStyle = c.eyeWhite;
        ctx.fillRect(x + 3, y + 3, 3, 3);
        ctx.fillRect(x + 8, y + 3, 3, 3);
        ctx.fillStyle = c.pupil;
        ctx.fillRect(x + 4, y + 4, 2, 2);
        ctx.fillRect(x + 9, y + 4, 2, 2);

        // Cute moss sprout on top
        ctx.fillStyle = c.sprout;
        ctx.fillRect(ox + 7, y - 2, 2, 3);
        ctx.fillStyle = c.leaf;
        ctx.fillRect(ox + 8, y - 3, 3, 2);
      } else {
        // Squashed flat frame
        ctx.fillStyle = c.shade;
        ctx.fillRect(ox + 1, 12, 14, 4);
        ctx.fillStyle = c.body;
        ctx.fillRect(ox + 2, 11, 12, 3);
        ctx.fillStyle = c.eyeWhite;
        ctx.fillRect(ox + 4, 12, 3, 1);
        ctx.fillRect(ox + 9, 12, 3, 1);
      }
    }

    scene.textures.addSpriteSheet('slime', canvas as unknown as HTMLImageElement, {
      frameWidth: fw,
      frameHeight: fh,
    });
  }

  /**
   * Spiky Beetle Enemy
   * 5 frames: 0..3 crawl, 4 upside down defeated
   */
  private static createBeetleSpritesheet(scene: Phaser.Scene): void {
    if (scene.textures.exists('beetle')) return;

    const fw = 20;
    const fh = 16;
    const { canvas, ctx } = this.createCanvas(fw * 5, fh);

    const c = {
      shell: '#c53030',
      shellShade: '#742a2a',
      shellSpot: '#ecc94b',
      head: '#2d3748',
      leg: '#1a202c',
      eye: '#fff5f5',
      pupil: '#c53030',
    };

    for (let f = 0; f < 5; f++) {
      const ox = f * fw;
      ctx.clearRect(ox, 0, fw, fh);

      if (f < 4) {
        const legShift = f % 2 === 0 ? 0 : 1;

        // Legs
        ctx.fillStyle = c.leg;
        ctx.fillRect(ox + 3 + legShift, 12, 2, 4);
        ctx.fillRect(ox + 8 - legShift, 12, 2, 4);
        ctx.fillRect(ox + 13 + legShift, 12, 2, 4);

        // Body shell
        ctx.fillStyle = c.shellShade;
        ctx.fillRect(ox + 2, 5, 14, 8);
        ctx.fillStyle = c.shell;
        ctx.fillRect(ox + 3, 4, 12, 8);

        // Spots & spike
        ctx.fillStyle = c.shellSpot;
        ctx.fillRect(ox + 6, 6, 2, 2);
        ctx.fillRect(ox + 11, 6, 2, 2);
        ctx.fillRect(ox + 8, 9, 2, 2);

        // Head and horn
        ctx.fillStyle = c.head;
        ctx.fillRect(ox + 15, 6, 4, 6);
        ctx.fillRect(ox + 18, 4, 2, 3); // small horn

        // Eye
        ctx.fillStyle = c.eye;
        ctx.fillRect(ox + 16, 7, 2, 2);
        ctx.fillStyle = c.pupil;
        ctx.fillRect(ox + 17, 7, 1, 1);
      } else {
        // Upside down defeated
        ctx.fillStyle = c.shellShade;
        ctx.fillRect(ox + 3, 8, 14, 6);
        ctx.fillStyle = c.shell;
        ctx.fillRect(ox + 4, 9, 12, 5);
        ctx.fillStyle = c.leg;
        ctx.fillRect(ox + 5, 4, 2, 4);
        ctx.fillRect(ox + 10, 4, 2, 4);
        ctx.fillRect(ox + 14, 4, 2, 4);
      }
    }

    scene.textures.addSpriteSheet('beetle', canvas as unknown as HTMLImageElement, {
      frameWidth: fw,
      frameHeight: fh,
    });
  }

  /**
   * Crystal Collectible
   * 6 frames: faceted rotating cyan gem with gleam
   */
  private static createCrystalSpritesheet(scene: Phaser.Scene): void {
    if (scene.textures.exists('crystal')) return;

    const fw = 16;
    const fh = 16;
    const { canvas, ctx } = this.createCanvas(fw * 6, fh);

    const c = {
      main: '#38bdf8',
      light: '#e0f2fe',
      shade: '#0284c7',
      deep: '#0369a1',
      spark: '#ffffff',
    };

    for (let f = 0; f < 6; f++) {
      const ox = f * fw;
      ctx.clearRect(ox, 0, fw, fh);

      const widthScale = [1.0, 0.8, 0.5, 0.8, 1.0, 1.0][f];
      const w = Math.round(10 * widthScale);
      const cx = ox + 8;

      // Draw Diamond Facets
      ctx.fillStyle = c.shade;
      ctx.beginPath();
      ctx.moveTo(cx, 2);
      ctx.lineTo(cx + w / 2, 7);
      ctx.lineTo(cx, 14);
      ctx.lineTo(cx - w / 2, 7);
      ctx.closePath();
      ctx.fill();

      // Top face
      ctx.fillStyle = c.light;
      ctx.beginPath();
      ctx.moveTo(cx, 2);
      ctx.lineTo(cx + w / 2, 7);
      ctx.lineTo(cx, 8);
      ctx.closePath();
      ctx.fill();

      // Left face
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(cx, 2);
      ctx.lineTo(cx - w / 2, 7);
      ctx.lineTo(cx, 8);
      ctx.closePath();
      ctx.fill();

      // Sparkle glint on frame 0 and 3
      if (f === 0 || f === 3) {
        ctx.fillStyle = c.spark;
        ctx.fillRect(cx - 1, 4, 2, 2);
        ctx.fillRect(cx - 2, 5, 4, 1);
      }
    }

    scene.textures.addSpriteSheet('crystal', canvas as unknown as HTMLImageElement, {
      frameWidth: fw,
      frameHeight: fh,
    });
  }

  /**
   * Mystery Crate
   * Active with Question Mark and Empty knocked block
   */
  private static createCrateTextures(scene: Phaser.Scene): void {
    if (scene.textures.exists('crate-active')) return;

    // 1. Active Question Block
    const { canvas: c1, ctx: ctx1 } = this.createCanvas(16, 16);
    ctx1.fillStyle = '#b45309'; // Outer border
    ctx1.fillRect(0, 0, 16, 16);
    ctx1.fillStyle = '#f59e0b'; // Gold wood
    ctx1.fillRect(1, 1, 14, 14);
    ctx1.fillStyle = '#d97706'; // Inner shadow
    ctx1.fillRect(13, 1, 2, 14);
    ctx1.fillRect(1, 13, 14, 2);
    // Screws / rivets in corners
    ctx1.fillStyle = '#78350f';
    ctx1.fillRect(2, 2, 2, 2);
    ctx1.fillRect(12, 2, 2, 2);
    ctx1.fillRect(2, 12, 2, 2);
    ctx1.fillRect(12, 12, 2, 2);
    // Question Mark '?'
    ctx1.fillStyle = '#ffffff';
    ctx1.fillRect(6, 4, 4, 2);
    ctx1.fillRect(9, 5, 2, 3);
    ctx1.fillRect(7, 7, 3, 2);
    ctx1.fillRect(7, 9, 2, 2);
    ctx1.fillRect(7, 12, 2, 2);
    scene.textures.addCanvas('crate-active', c1);

    // 2. Empty / Expended Block
    const { canvas: c2, ctx: ctx2 } = this.createCanvas(16, 16);
    ctx2.fillStyle = '#475569';
    ctx2.fillRect(0, 0, 16, 16);
    ctx2.fillStyle = '#64748b';
    ctx2.fillRect(1, 1, 14, 14);
    ctx2.fillStyle = '#334155';
    ctx2.fillRect(13, 1, 2, 14);
    ctx2.fillRect(1, 13, 14, 2);
    ctx2.fillStyle = '#1e293b';
    ctx2.fillRect(2, 2, 2, 2);
    ctx2.fillRect(12, 2, 2, 2);
    ctx2.fillRect(2, 12, 2, 2);
    ctx2.fillRect(12, 12, 2, 2);
    scene.textures.addCanvas('crate-empty', c2);

    // 3. Breakable Stone Block
    const { canvas: c3, ctx: ctx3 } = this.createCanvas(16, 16);
    ctx3.fillStyle = '#334155';
    ctx3.fillRect(0, 0, 16, 16);
    ctx3.fillStyle = '#64748b';
    ctx3.fillRect(1, 1, 14, 14);
    ctx3.fillStyle = '#94a3b8';
    ctx3.fillRect(2, 2, 6, 4);
    ctx3.fillRect(9, 8, 5, 5);
    ctx3.fillStyle = '#475569';
    ctx3.fillRect(1, 7, 14, 1);
    ctx3.fillRect(7, 1, 1, 6);
    ctx3.fillRect(9, 8, 1, 7);
    scene.textures.addCanvas('block-stone', c3);
  }

  /**
   * Spring Mushroom for high bouncy jumps
   */
  private static createMushroomTextures(scene: Phaser.Scene): void {
    if (scene.textures.exists('spring-idle')) return;

    // Idle
    const { canvas: c1, ctx: ctx1 } = this.createCanvas(16, 16);
    // Stem
    ctx1.fillStyle = '#fed7aa';
    ctx1.fillRect(6, 9, 4, 7);
    ctx1.fillStyle = '#fdba74';
    ctx1.fillRect(9, 9, 1, 7);
    // Cap
    ctx1.fillStyle = '#dc2626';
    ctx1.fillRect(2, 3, 12, 6);
    ctx1.fillRect(4, 2, 8, 8);
    // Spots
    ctx1.fillStyle = '#ffffff';
    ctx1.fillRect(4, 4, 2, 2);
    ctx1.fillRect(10, 4, 2, 2);
    ctx1.fillRect(7, 6, 2, 2);
    scene.textures.addCanvas('spring-idle', c1);

    // Bounce (squashed)
    const { canvas: c2, ctx: ctx2 } = this.createCanvas(16, 16);
    ctx2.fillStyle = '#fed7aa';
    ctx2.fillRect(5, 12, 6, 4);
    ctx2.fillStyle = '#dc2626';
    ctx2.fillRect(1, 8, 14, 4);
    ctx2.fillStyle = '#ffffff';
    ctx2.fillRect(4, 9, 2, 2);
    ctx2.fillRect(10, 9, 2, 2);
    scene.textures.addCanvas('spring-bounce', c2);
  }

  /**
   * Heart / Life Pickup
   */
  private static createHeartTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists('heart-item')) return;

    const { canvas, ctx } = this.createCanvas(16, 16);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(3, 3, 4, 4);
    ctx.fillRect(9, 3, 4, 4);
    ctx.fillRect(2, 5, 12, 4);
    ctx.fillRect(4, 9, 8, 3);
    ctx.fillRect(6, 12, 4, 2);
    ctx.fillRect(7, 14, 2, 1);
    // Shine
    ctx.fillStyle = '#fee2e2';
    ctx.fillRect(4, 4, 2, 2);
    scene.textures.addCanvas('heart-item', canvas);
  }

  /**
   * Environment Tiles (Grass top, Dirt, Wooden Bridge, Vines, Flowers, Bushes, Clouds, Hills)
   */
  private static createEnvironmentTiles(scene: Phaser.Scene): void {
    if (scene.textures.exists('tile-grass-top')) return;

    // 1. Grass Top Tile (16x16)
    const { canvas: cGrass, ctx: ctxGrass } = this.createCanvas(16, 16);
    // Dirt base
    ctxGrass.fillStyle = '#78350f';
    ctxGrass.fillRect(0, 0, 16, 16);
    ctxGrass.fillStyle = '#92400e';
    ctxGrass.fillRect(2, 7, 3, 3);
    ctxGrass.fillRect(10, 11, 4, 3);
    // Grass top layer
    ctxGrass.fillStyle = '#15803d'; // Dark grass fringe
    ctxGrass.fillRect(0, 0, 16, 6);
    ctxGrass.fillStyle = '#22c55e'; // Vibrant meadow green
    ctxGrass.fillRect(0, 0, 16, 4);
    // Hanging blades
    ctxGrass.fillStyle = '#16a34a';
    ctxGrass.fillRect(1, 4, 2, 2);
    ctxGrass.fillRect(5, 4, 2, 3);
    ctxGrass.fillRect(9, 4, 2, 2);
    ctxGrass.fillRect(13, 4, 2, 3);
    scene.textures.addCanvas('tile-grass-top', cGrass);

    // 2. Dirt Base Tile (16x16)
    const { canvas: cDirt, ctx: ctxDirt } = this.createCanvas(16, 16);
    ctxDirt.fillStyle = '#78350f';
    ctxDirt.fillRect(0, 0, 16, 16);
    ctxDirt.fillStyle = '#92400e';
    ctxDirt.fillRect(2, 3, 4, 3);
    ctxDirt.fillRect(9, 8, 4, 4);
    ctxDirt.fillStyle = '#592507';
    ctxDirt.fillRect(12, 2, 3, 3);
    ctxDirt.fillRect(3, 11, 3, 3);
    scene.textures.addCanvas('tile-dirt', cDirt);

    // 3. Wooden Bridge / Platform (16x16)
    const { canvas: cBridge, ctx: ctxBridge } = this.createCanvas(16, 16);
    ctxBridge.fillStyle = '#b45309';
    ctxBridge.fillRect(0, 0, 16, 6);
    ctxBridge.fillStyle = '#d97706';
    ctxBridge.fillRect(1, 1, 14, 4);
    ctxBridge.fillStyle = '#78350f';
    ctxBridge.fillRect(7, 0, 2, 6);
    ctxBridge.fillRect(0, 6, 2, 4);
    ctxBridge.fillRect(14, 6, 2, 4);
    scene.textures.addCanvas('tile-bridge', cBridge);

    // 4. Bush (24x16)
    const { canvas: cBush, ctx: ctxBush } = this.createCanvas(24, 16);
    ctxBush.fillStyle = '#15803d';
    ctxBush.fillRect(3, 6, 18, 10);
    ctxBush.fillStyle = '#22c55e';
    ctxBush.fillRect(5, 2, 14, 12);
    ctxBush.fillRect(2, 5, 8, 8);
    ctxBush.fillRect(14, 5, 8, 8);
    ctxBush.fillStyle = '#4ade80';
    ctxBush.fillRect(7, 3, 4, 3);
    scene.textures.addCanvas('tile-bush', cBush);

    // 5. Flower Decor (12x12)
    const { canvas: cFlower, ctx: ctxFlower } = this.createCanvas(12, 12);
    ctxFlower.fillStyle = '#15803d';
    ctxFlower.fillRect(5, 5, 2, 7);
    ctxFlower.fillStyle = '#fbbf24';
    ctxFlower.fillRect(4, 2, 4, 4);
    ctxFlower.fillStyle = '#ffffff';
    ctxFlower.fillRect(5, 0, 2, 2);
    ctxFlower.fillRect(5, 6, 2, 2);
    ctxFlower.fillRect(2, 3, 2, 2);
    ctxFlower.fillRect(8, 3, 2, 2);
    scene.textures.addCanvas('tile-flower', cFlower);

    // 6. Fluffy Cloud (64x24)
    const { canvas: cCloud, ctx: ctxCloud } = this.createCanvas(64, 24);
    ctxCloud.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctxCloud.fillRect(8, 10, 48, 12);
    ctxCloud.fillRect(16, 6, 32, 14);
    ctxCloud.fillRect(24, 2, 16, 18);
    ctxCloud.fillStyle = '#ffffff';
    ctxCloud.fillRect(12, 12, 40, 8);
    ctxCloud.fillRect(20, 8, 24, 10);
    ctxCloud.fillRect(26, 4, 12, 8);
    scene.textures.addCanvas('bg-cloud', cCloud);

    // 7. Rolling Green Hill (96x48)
    const { canvas: cHill, ctx: ctxHill } = this.createCanvas(96, 48);
    ctxHill.fillStyle = '#1e3a2b';
    ctxHill.beginPath();
    ctxHill.ellipse(48, 48, 48, 40, 0, Math.PI, 0);
    ctxHill.fill();
    ctxHill.fillStyle = '#2d5a3f';
    ctxHill.beginPath();
    ctxHill.ellipse(48, 48, 44, 36, 0, Math.PI, 0);
    ctxHill.fill();
    scene.textures.addCanvas('bg-hill', cHill);

    // 8. Distant Mountain Silhouette (140x60)
    const { canvas: cMtn, ctx: ctxMtn } = this.createCanvas(140, 60);
    ctxMtn.fillStyle = '#1e293b';
    ctxMtn.beginPath();
    ctxMtn.moveTo(0, 60);
    ctxMtn.lineTo(45, 10);
    ctxMtn.lineTo(70, 30);
    ctxMtn.lineTo(105, 5);
    ctxMtn.lineTo(140, 60);
    ctxMtn.closePath();
    ctxMtn.fill();
    // Snow cap
    ctxMtn.fillStyle = '#cbd5e1';
    ctxMtn.beginPath();
    ctxMtn.moveTo(45, 10);
    ctxMtn.lineTo(52, 22);
    ctxMtn.lineTo(38, 22);
    ctxMtn.closePath();
    ctxMtn.fill();
    ctxMtn.beginPath();
    ctxMtn.moveTo(105, 5);
    ctxMtn.lineTo(114, 20);
    ctxMtn.lineTo(96, 20);
    ctxMtn.closePath();
    ctxMtn.fill();
    scene.textures.addCanvas('bg-mountain', cMtn);
  }

  /**
   * Exit Gate: Stone archway with magical glowing crystal portal
   * Size: 32x48 pixels
   */
  private static createExitGateTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists('exit-gate')) return;

    const { canvas, ctx } = this.createCanvas(32, 48);

    // Stone Pillars
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(2, 10, 7, 38);
    ctx.fillRect(23, 10, 7, 38);
    // Stone Arch Top
    ctx.fillRect(4, 2, 24, 10);

    // Stone Texture Details
    ctx.fillStyle = '#334155';
    ctx.fillRect(3, 11, 5, 36);
    ctx.fillRect(24, 11, 5, 36);
    ctx.fillRect(5, 3, 22, 8);

    // Carved Rune Insets
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(5, 18, 2, 2);
    ctx.fillRect(5, 28, 2, 2);
    ctx.fillRect(25, 18, 2, 2);
    ctx.fillRect(25, 28, 2, 2);

    // Glowing Inner Portal
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(9, 12, 14, 36);
    // Swirling Energy
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(10, 13, 12, 35);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(11, 16, 10, 30);
    ctx.fillStyle = '#a5f3fc';
    ctx.fillRect(13, 22, 6, 20);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 28, 4, 8);

    // Arch Keystone Gem
    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(14, 4, 4, 4);

    scene.textures.addCanvas('exit-gate', canvas);
  }

  /**
   * Particles: Sparkle, Dust puff, Attack slash arc
   */
  private static createParticleTextures(scene: Phaser.Scene): void {
    if (scene.textures.exists('particle-sparkle')) return;

    // Sparkle
    const { canvas: c1, ctx: ctx1 } = this.createCanvas(6, 6);
    ctx1.fillStyle = '#38bdf8';
    ctx1.fillRect(2, 0, 2, 6);
    ctx1.fillRect(0, 2, 6, 2);
    ctx1.fillStyle = '#ffffff';
    ctx1.fillRect(2, 2, 2, 2);
    scene.textures.addCanvas('particle-sparkle', c1);

    // Dust
    const { canvas: c2, ctx: ctx2 } = this.createCanvas(8, 8);
    ctx2.fillStyle = '#e2e8f0';
    ctx2.beginPath();
    ctx2.arc(4, 4, 3, 0, Math.PI * 2);
    ctx2.fill();
    scene.textures.addCanvas('particle-dust', c2);

    // Hit Spark
    const { canvas: c3, ctx: ctx3 } = this.createCanvas(8, 8);
    ctx3.fillStyle = '#f59e0b';
    ctx3.fillRect(3, 1, 2, 6);
    ctx3.fillRect(1, 3, 6, 2);
    ctx3.fillStyle = '#fef08a';
    ctx3.fillRect(3, 3, 2, 2);
    scene.textures.addCanvas('particle-hit', c3);
  }

  /**
   * Cavern environment tiles, hazard spikes, and moving platforms
   */
  private static createCavernAndHazardTiles(scene: Phaser.Scene): void {
    if (scene.textures.exists('tile-cave-top')) return;

    // 1. Cave Top Tile (16x16) - Dark purple-slate stone with glowing cyan crystal fringe
    const { canvas: cCaveTop, ctx: ctxCaveTop } = this.createCanvas(16, 16);
    ctxCaveTop.fillStyle = '#1e1b4b'; // Deep dark rock
    ctxCaveTop.fillRect(0, 0, 16, 16);
    ctxCaveTop.fillStyle = '#312e81'; // Shadowed rock
    ctxCaveTop.fillRect(2, 6, 4, 4);
    ctxCaveTop.fillRect(10, 10, 5, 4);
    // Crystal stone surface
    ctxCaveTop.fillStyle = '#4338ca';
    ctxCaveTop.fillRect(0, 0, 16, 5);
    ctxCaveTop.fillStyle = '#06b6d4'; // Cyan crystalline rim
    ctxCaveTop.fillRect(0, 0, 16, 2);
    ctxCaveTop.fillStyle = '#67e8f9';
    ctxCaveTop.fillRect(3, 2, 2, 2);
    ctxCaveTop.fillRect(8, 2, 3, 2);
    ctxCaveTop.fillRect(13, 2, 2, 2);
    scene.textures.addCanvas('tile-cave-top', cCaveTop);

    // 2. Cave Dirt/Base Tile (16x16)
    const { canvas: cCaveDirt, ctx: ctxCaveDirt } = this.createCanvas(16, 16);
    ctxCaveDirt.fillStyle = '#0f172a';
    ctxCaveDirt.fillRect(0, 0, 16, 16);
    ctxCaveDirt.fillStyle = '#1e293b';
    ctxCaveDirt.fillRect(2, 2, 5, 4);
    ctxCaveDirt.fillRect(9, 7, 5, 5);
    ctxCaveDirt.fillStyle = '#334155';
    ctxCaveDirt.fillRect(11, 2, 3, 3);
    ctxCaveDirt.fillRect(3, 11, 4, 3);
    // Tiny embedded glowing gem flecks
    ctxCaveDirt.fillStyle = '#38bdf8';
    ctxCaveDirt.fillRect(4, 5, 1, 1);
    ctxCaveDirt.fillRect(12, 11, 1, 1);
    scene.textures.addCanvas('tile-cave-dirt', cCaveDirt);

    // 3. Hazard Spikes (16x16)
    const { canvas: cSpike, ctx: ctxSpike } = this.createCanvas(16, 16);
    ctxSpike.fillStyle = '#334155'; // Base stone
    ctxSpike.fillRect(0, 14, 16, 2);
    // 3 sharp triangular spikes
    const drawSpike = (x: number) => {
      ctxSpike.fillStyle = '#64748b';
      ctxSpike.beginPath();
      ctxSpike.moveTo(x, 14);
      ctxSpike.lineTo(x + 2, 3);
      ctxSpike.lineTo(x + 5, 14);
      ctxSpike.closePath();
      ctxSpike.fill();
      // Sharp red threat tip
      ctxSpike.fillStyle = '#ef4444';
      ctxSpike.fillRect(x + 1, 3, 2, 3);
      ctxSpike.fillStyle = '#fca5a5';
      ctxSpike.fillRect(x + 2, 3, 1, 2);
    };
    drawSpike(0);
    drawSpike(5);
    drawSpike(10);
    scene.textures.addCanvas('tile-spike', cSpike);

    // 4. Moving Platform (32x12)
    const { canvas: cPlat, ctx: ctxPlat } = this.createCanvas(32, 12);
    ctxPlat.fillStyle = '#1e293b';
    ctxPlat.fillRect(0, 0, 32, 12);
    ctxPlat.fillStyle = '#334155';
    ctxPlat.fillRect(1, 1, 30, 10);
    ctxPlat.fillStyle = '#0ea5e9'; // Runic energy border
    ctxPlat.fillRect(0, 0, 32, 2);
    ctxPlat.fillRect(0, 10, 32, 2);
    // Glowing center runic jewel
    ctxPlat.fillStyle = '#38bdf8';
    ctxPlat.fillRect(14, 4, 4, 4);
    ctxPlat.fillStyle = '#ffffff';
    ctxPlat.fillRect(15, 5, 2, 2);
    scene.textures.addCanvas('tile-moving-plat', cPlat);

    // 5. Hanging Stalactite (24x40)
    const { canvas: cStal, ctx: ctxStal } = this.createCanvas(24, 40);
    ctxStal.fillStyle = '#1e293b';
    ctxStal.beginPath();
    ctxStal.moveTo(0, 0);
    ctxStal.lineTo(24, 0);
    ctxStal.lineTo(12, 40);
    ctxStal.closePath();
    ctxStal.fill();
    ctxStal.fillStyle = '#334155';
    ctxStal.beginPath();
    ctxStal.moveTo(4, 0);
    ctxStal.lineTo(18, 0);
    ctxStal.lineTo(12, 34);
    ctxStal.closePath();
    ctxStal.fill();
    // Glowing crystal tip
    ctxStal.fillStyle = '#38bdf8';
    ctxStal.fillRect(11, 35, 2, 4);
    scene.textures.addCanvas('bg-stalactite', cStal);
  }

  /**
   * Boss: Gorgath the Crystal Golem (48x48 spritesheet)
   * Frames:
   * 0..2: Walk / Heavy Stomp
   * 3: Ground Pound Attack
   * 4: Stunned / Vulnerable (weakpoint glowing on head)
   * 5: Defeated
   */
  private static createBossTextures(scene: Phaser.Scene): void {
    if (scene.textures.exists('boss-gorgath')) return;

    const fw = 48;
    const fh = 48;
    const totalFrames = 6;
    const { canvas, ctx } = this.createCanvas(fw * totalFrames, fh);

    const c = {
      stone: '#334155',
      stoneDark: '#1e293b',
      stoneLight: '#64748b',
      moss: '#15803d',
      mossLight: '#22c55e',
      crystal: '#38bdf8',
      crystalGlow: '#a5f3fc',
      crystalCore: '#0284c7',
      eye: '#67e8f9',
      eyeAngry: '#f43f5e',
    };

    for (let f = 0; f < totalFrames; f++) {
      const ox = f * fw;
      ctx.clearRect(ox, 0, fw, fh);

      let bob = 0;
      let armY = 0;
      let isStunned = f === 4;
      let isPound = f === 3;
      let isDefeated = f === 5;

      if (f < 3) {
        bob = f === 1 ? -2 : 0;
        armY = f === 0 ? 0 : f === 1 ? -2 : 2;
      } else if (isPound) {
        bob = 3;
        armY = -6;
      } else if (isStunned) {
        bob = 6;
        armY = 8;
      } else if (isDefeated) {
        bob = 10;
        armY = 12;
      }

      // 1. Colossal Legs
      ctx.fillStyle = c.stoneDark;
      ctx.fillRect(ox + 12, 34 + bob, 10, 14);
      ctx.fillRect(ox + 26, 34 + bob, 10, 14);
      ctx.fillStyle = c.stone;
      ctx.fillRect(ox + 10, 42 + bob, 12, 6);
      ctx.fillRect(ox + 26, 42 + bob, 12, 6);

      // 2. Massive Torso
      ctx.fillStyle = isDefeated ? '#475569' : c.stoneDark;
      ctx.fillRect(ox + 10, 16 + bob, 28, 20);
      ctx.fillStyle = c.stone;
      ctx.fillRect(ox + 12, 18 + bob, 24, 16);

      // Moss Overgrowth on Shoulders
      ctx.fillStyle = c.moss;
      ctx.fillRect(ox + 8, 14 + bob, 8, 4);
      ctx.fillRect(ox + 32, 14 + bob, 8, 4);
      ctx.fillStyle = c.mossLight;
      ctx.fillRect(ox + 10, 14 + bob, 4, 2);
      ctx.fillRect(ox + 34, 14 + bob, 4, 2);

      // 3. Glowing Radiant Crystal Core (Chest)
      ctx.fillStyle = isStunned ? '#f43f5e' : c.crystalCore;
      ctx.fillRect(ox + 20, 22 + bob, 8, 8);
      ctx.fillStyle = isStunned ? '#fb7185' : c.crystal;
      ctx.fillRect(ox + 21, 23 + bob, 6, 6);
      ctx.fillStyle = isStunned ? '#ffffff' : c.crystalGlow;
      ctx.fillRect(ox + 23, 25 + bob, 2, 2);

      // 4. Heavy Stone Arms & Fists
      ctx.fillStyle = c.stoneLight;
      if (isPound) {
        // Raised Fists Above Head
        ctx.fillRect(ox + 4, 6 + armY, 8, 14);
        ctx.fillRect(ox + 36, 6 + armY, 8, 14);
        ctx.fillStyle = c.crystal;
        ctx.fillRect(ox + 4, 4 + armY, 8, 4);
        ctx.fillRect(ox + 36, 4 + armY, 8, 4);
      } else {
        // Arms at side
        ctx.fillRect(ox + 4, 20 + armY + bob, 8, 16);
        ctx.fillRect(ox + 36, 20 - armY + bob, 8, 16);
        ctx.fillStyle = c.crystal;
        ctx.fillRect(ox + 5, 32 + armY + bob, 6, 4);
        ctx.fillRect(ox + 37, 32 - armY + bob, 6, 4);
      }

      // 5. Head & Horn Crystals
      ctx.fillStyle = c.stoneDark;
      ctx.fillRect(ox + 16, 6 + bob, 16, 12);
      ctx.fillStyle = c.stone;
      ctx.fillRect(ox + 18, 8 + bob, 12, 10);

      // Glowing Crystal Crown on Head (Pip can stomp this when boss is stunned!)
      ctx.fillStyle = isStunned ? '#f43f5e' : c.crystal;
      ctx.fillRect(ox + 22, 2 + bob, 4, 6);
      ctx.fillRect(ox + 19, 4 + bob, 10, 2);
      ctx.fillStyle = isStunned ? '#fff' : c.crystalGlow;
      ctx.fillRect(ox + 23, 1 + bob, 2, 3);

      // Glowing Eyes
      ctx.fillStyle = isStunned ? '#fb7185' : isPound ? c.eyeAngry : c.eye;
      ctx.fillRect(ox + 20, 11 + bob, 3, 2);
      ctx.fillRect(ox + 25, 11 + bob, 3, 2);
    }

    scene.textures.addSpriteSheet('boss-gorgath', canvas as unknown as HTMLImageElement, {
      frameWidth: fw,
      frameHeight: fh,
    });

    // 6. Boss Projectile: Crystal Shard (12x12)
    const { canvas: cShard, ctx: ctxShard } = this.createCanvas(12, 12);
    ctxShard.fillStyle = '#0284c7';
    ctxShard.beginPath();
    ctxShard.moveTo(6, 0);
    ctxShard.lineTo(12, 6);
    ctxShard.lineTo(6, 12);
    ctxShard.lineTo(0, 6);
    ctxShard.closePath();
    ctxShard.fill();
    ctxShard.fillStyle = '#38bdf8';
    ctxShard.fillRect(3, 3, 6, 6);
    ctxShard.fillStyle = '#ffffff';
    ctxShard.fillRect(5, 5, 2, 2);
    scene.textures.addCanvas('projectile-shard', cShard);

    // 7. Boss Shockwave (20x10)
    const { canvas: cWave, ctx: ctxWave } = this.createCanvas(20, 10);
    ctxWave.fillStyle = '#38bdf8';
    ctxWave.fillRect(4, 2, 12, 6);
    ctxWave.fillStyle = '#67e8f9';
    ctxWave.fillRect(2, 4, 16, 4);
    ctxWave.fillStyle = '#ffffff';
    ctxWave.fillRect(7, 5, 6, 2);
    scene.textures.addCanvas('boss-shockwave', cWave);
  }

  /**
   * Water hazard textures: surface animated waves, deep water, bubbles, and splash droplets
   */
  private static createWaterTextures(scene: Phaser.Scene): void {
    if (scene.textures.exists('tile-water-top')) return;

    // 1. Meadow Water Top (16x16) - Translucent animated crystalline surface wave
    const { canvas: cWaterTop, ctx: ctxWaterTop } = this.createCanvas(16, 16);
    // Translucent aqua body
    ctxWaterTop.fillStyle = 'rgba(14, 165, 233, 0.75)';
    ctxWaterTop.fillRect(0, 3, 16, 13);
    // Deep blue undertone
    ctxWaterTop.fillStyle = 'rgba(2, 132, 199, 0.85)';
    ctxWaterTop.fillRect(0, 7, 16, 9);
    // Foam wave peaks
    ctxWaterTop.fillStyle = '#ffffff';
    ctxWaterTop.fillRect(1, 1, 4, 2);
    ctxWaterTop.fillRect(9, 1, 5, 2);
    // Light cyan crest
    ctxWaterTop.fillStyle = '#bae6fd';
    ctxWaterTop.fillRect(0, 2, 6, 2);
    ctxWaterTop.fillRect(8, 2, 8, 2);
    // Sparkle flecks
    ctxWaterTop.fillStyle = '#f0f9ff';
    ctxWaterTop.fillRect(3, 5, 2, 1);
    ctxWaterTop.fillRect(11, 6, 2, 1);
    scene.textures.addCanvas('tile-water-top', cWaterTop);

    // 2. Meadow Water Deep (16x16)
    const { canvas: cWaterDeep, ctx: ctxWaterDeep } = this.createCanvas(16, 16);
    ctxWaterDeep.fillStyle = '#0369a1';
    ctxWaterDeep.fillRect(0, 0, 16, 16);
    ctxWaterDeep.fillStyle = '#0284c7';
    ctxWaterDeep.fillRect(2, 3, 5, 2);
    ctxWaterDeep.fillRect(9, 9, 6, 2);
    ctxWaterDeep.fillStyle = '#075985';
    ctxWaterDeep.fillRect(0, 12, 16, 4);
    scene.textures.addCanvas('tile-water-deep', cWaterDeep);

    // 3. Cavern Crystal Water Top (16x16) - Bioluminescent cyan-purple pool
    const { canvas: cCaveWaterTop, ctx: ctxCaveWaterTop } = this.createCanvas(16, 16);
    ctxCaveWaterTop.fillStyle = 'rgba(30, 27, 75, 0.85)';
    ctxCaveWaterTop.fillRect(0, 3, 16, 13);
    ctxCaveWaterTop.fillStyle = 'rgba(6, 182, 212, 0.7)';
    ctxCaveWaterTop.fillRect(0, 4, 16, 12);
    // Bioluminescent highlights
    ctxCaveWaterTop.fillStyle = '#67e8f9';
    ctxCaveWaterTop.fillRect(1, 1, 4, 2);
    ctxCaveWaterTop.fillRect(9, 1, 5, 2);
    ctxCaveWaterTop.fillStyle = '#c084fc';
    ctxCaveWaterTop.fillRect(0, 2, 6, 2);
    ctxCaveWaterTop.fillRect(8, 2, 8, 2);
    scene.textures.addCanvas('tile-cave-water-top', cCaveWaterTop);

    // 4. Cavern Crystal Water Deep (16x16)
    const { canvas: cCaveWaterDeep, ctx: ctxCaveWaterDeep } = this.createCanvas(16, 16);
    cCaveWaterDeep.width = 16;
    ctxCaveWaterDeep.fillStyle = '#0f172a';
    ctxCaveWaterDeep.fillRect(0, 0, 16, 16);
    ctxCaveWaterDeep.fillStyle = '#1e1b4b';
    ctxCaveWaterDeep.fillRect(0, 0, 16, 8);
    ctxCaveWaterDeep.fillStyle = '#312e81';
    ctxCaveWaterDeep.fillRect(2, 4, 4, 2);
    ctxCaveWaterDeep.fillRect(10, 8, 4, 2);
    scene.textures.addCanvas('tile-cave-water-deep', cCaveWaterDeep);

    // 5. Water Splash Particle (6x6)
    const { canvas: cSplash, ctx: ctxSplash } = this.createCanvas(6, 6);
    ctxSplash.fillStyle = '#bae6fd';
    ctxSplash.fillRect(1, 1, 4, 4);
    ctxSplash.fillStyle = '#ffffff';
    ctxSplash.fillRect(2, 2, 2, 2);
    scene.textures.addCanvas('particle-splash', cSplash);

    // 6. Water Bubble Particle (4x4)
    const { canvas: cBubble, ctx: ctxBubble } = this.createCanvas(4, 4);
    ctxBubble.fillStyle = '#38bdf8';
    ctxBubble.fillRect(0, 1, 4, 2);
    ctxBubble.fillRect(1, 0, 2, 4);
    ctxBubble.fillStyle = '#ffffff';
    ctxBubble.fillRect(1, 1, 1, 1);
    scene.textures.addCanvas('particle-bubble', cBubble);
  }
}
