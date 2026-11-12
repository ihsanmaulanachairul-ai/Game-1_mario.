/**
 * Web Audio Synthesized Retro Sound System for Tiny Trails: Crystal Run
 * No external asset dependencies - runs 100% reliably in all browsers.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private volume: number = 0.6;
  private bgmInterval: number | null = null;
  private isBgmPlaying: boolean = false;
  private currentTheme: 'meadow' | 'cavern' | 'boss' = 'meadow';
  private noteIndex: number = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopBGM();
    } else if (this.isBgmPlaying) {
      this.startBGM(this.currentTheme);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  // --- Sound Effects ---

  public playJump() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(460, now + 0.12);

    gain.gain.setValueAtTime(0.18 * this.volume, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playSpring() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.22);

    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  public playCrystal() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [987.77, 1318.51, 1567.98]; // B5, E6, G6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.045;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15 * this.volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.19);
    });
  }

  public playCrateHit() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playEnemyStomp() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.14);

    gain.gain.setValueAtTime(0.22 * this.volume, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playAttack() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);

    gain.gain.setValueAtTime(0.14 * this.volume, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playHurt() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(130, now);
    osc1.frequency.exponentialRampToValueAtTime(60, now + 0.18);
    osc2.frequency.setValueAtTime(95, now);
    osc2.frequency.exponentialRampToValueAtTime(40, now + 0.18);

    gain.gain.setValueAtTime(0.28 * this.volume, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.19);
    osc2.stop(now + 0.19);
  }

  public playSpike() {
    this.playHurt();
  }

  // --- Boss Sounds ---

  public playBossHit() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.22);

    gain.gain.setValueAtTime(0.35 * this.volume, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  public playBossRoar() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.6);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.61);
  }

  public playShockwave() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);

    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playBossDefeat() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [180, 240, 320, 480, 640].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.12;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.2);

      gain.gain.setValueAtTime(0.25 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  public playGameOver() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [392.0, 349.23, 329.63, 261.63]; // G4, F4, E4, C4
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.18;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.23);
    });
  }

  public playVictory() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.5, d: 0.28 }, // C6
      { f: 880.0, d: 0.15 },  // A5
      { f: 1046.5, d: 0.45 }, // C6
    ];

    let t = this.ctx.currentTime;
    notes.forEach((item) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(item.f, t);

      gain.gain.setValueAtTime(0.2 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + item.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + item.d + 0.02);

      t += item.d + 0.04;
    });
  }

  // --- Background Melody Loops ---

  public startBGM(theme: 'meadow' | 'cavern' | 'boss' = 'meadow') {
    this.currentTheme = theme;
    this.isBgmPlaying = true;
    if (!this.musicEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    this.stopBGM();

    let melody: Array<{ f: number; d: number }>;
    let stepDurationMs = 280;

    if (theme === 'boss') {
      // Fast, dramatic, intense boss battle theme in D Minor
      melody = [
        { f: 293.66, d: 0.12 }, // D4
        { f: 349.23, d: 0.12 }, // F4
        { f: 440.00, d: 0.12 }, // A4
        { f: 587.33, d: 0.15 }, // D5
        { f: 554.37, d: 0.12 }, // C#5
        { f: 440.00, d: 0.12 }, // A4
        { f: 349.23, d: 0.12 }, // F4
        { f: 311.13, d: 0.15 }, // Eb4
        { f: 293.66, d: 0.12 }, // D4
        { f: 349.23, d: 0.12 }, // F4
        { f: 440.00, d: 0.12 }, // A4
        { f: 659.25, d: 0.22 }, // E5
      ];
      stepDurationMs = 190;
    } else if (theme === 'cavern') {
      // Atmospheric, crystalline, mysterious cavern theme
      melody = [
        { f: 440.00, d: 0.22 }, // A4
        { f: 523.25, d: 0.22 }, // C5
        { f: 659.25, d: 0.25 }, // E5
        { f: 783.99, d: 0.20 }, // G5
        { f: 659.25, d: 0.22 }, // E5
        { f: 587.33, d: 0.22 }, // D5
        { f: 523.25, d: 0.30 }, // C5
        { f: 392.00, d: 0.25 }, // G4
      ];
      stepDurationMs = 320;
    } else {
      // Charming Greenfield Crossing arpeggio pattern in C Major
      melody = [
        { f: 523.25, d: 0.18 }, // C5
        { f: 659.25, d: 0.18 }, // E5
        { f: 783.99, d: 0.18 }, // G5
        { f: 1046.5, d: 0.25 }, // C6
        { f: 880.0, d: 0.18 },  // A5
        { f: 783.99, d: 0.18 }, // G5
        { f: 659.25, d: 0.25 }, // E5
        { f: 587.33, d: 0.18 }, // D5
        { f: 523.25, d: 0.18 }, // C5
        { f: 659.25, d: 0.18 }, // E5
        { f: 783.99, d: 0.25 }, // G5
        { f: 698.46, d: 0.18 }, // F5
        { f: 659.25, d: 0.18 }, // E5
        { f: 587.33, d: 0.35 }, // D5
      ];
      stepDurationMs = 280;
    }

    this.noteIndex = 0;

    this.bgmInterval = window.setInterval(() => {
      if (!this.musicEnabled || !this.ctx || this.ctx.state !== 'running') return;
      const note = melody[this.noteIndex % melody.length];
      this.noteIndex++;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = theme === 'boss' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(note.f, now);

      gain.gain.setValueAtTime((theme === 'boss' ? 0.03 : 0.04) * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + note.d + 0.02);
    }, stepDurationMs);
  }

  public stopBGM() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public destroy() {
    this.stopBGM();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export const soundManager = new SoundManager();
