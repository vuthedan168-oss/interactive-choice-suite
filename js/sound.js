/**
 * Zero-dependency Web Audio API synthesizer for sound effects and upbeat background music
 */

class SoundFx {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.bgmGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBoing() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.24);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.26);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {
      console.warn("Audio playBoing error:", e);
    }
  }

  playWhoosh() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.16);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn("Audio playWhoosh error:", e);
    }
  }

  playSelect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn("Audio playSelect error:", e);
    }
  }

  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.09;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.005, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.38);
      });
    } catch (e) {
      console.warn("Audio playSuccess error:", e);
    }
  }

  playFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [
        { f: 261.63, d: 0.12, pause: 0 },
        { f: 392.00, d: 0.12, pause: 0.13 },
        { f: 523.25, d: 0.15, pause: 0.26 },
        { f: 659.25, d: 0.15, pause: 0.42 },
        { f: 783.99, d: 0.22, pause: 0.58 },
        { f: 1046.50, d: 0.65, pause: 0.82 }
      ];

      const now = this.ctx.currentTime;

      notes.forEach((note) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + note.pause;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.005, startTime + note.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + note.d + 0.05);
      });
    } catch (e) {
      console.warn("Audio playFanfare error:", e);
    }
  }

  /* ========================================================
   * UPBEAT LOVE BGM SYNTHESIZER
   * Cute cheerful pop progression: C - G - Am - F
   * ======================================================== */
  startBgm() {
    this.init();
    if (!this.ctx || this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.bgmStep = 0;

    // Chord & Melody note table (frequencies in Hz)
    // C major (C4, E4, G4, C5), G major (G3, B3, D4, G4), A minor (A3, C4, E4, A4), F major (F3, A3, C4, F4)
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C
      [196.00, 246.94, 293.66, 392.00], // G
      [220.00, 261.63, 329.63, 440.00], // Am
      [174.61, 220.00, 261.63, 349.23]  // F
    ];

    const melodySteps = [
      523.25, 659.25, 783.99, 659.25, 523.25, 659.25, 523.25, 392.00,
      392.00, 493.88, 587.33, 493.88, 392.00, 493.88, 587.33, 493.88,
      440.00, 523.25, 659.25, 523.25, 440.00, 523.25, 659.25, 523.25,
      349.23, 440.00, 523.25, 440.00, 523.25, 659.25, 783.99, 659.25
    ];

    const tick = () => {
      if (!this.bgmPlaying || this.muted) {
        if (this.bgmPlaying) {
          this.bgmTimer = setTimeout(tick, 220);
        }
        return;
      }

      try {
        const now = this.ctx.currentTime;
        const currentChordIdx = Math.floor((this.bgmStep % 32) / 8);
        const chordNotes = chords[currentChordIdx];

        // 1. Play soft marimba melody note
        const melodyFreq = melodySteps[this.bgmStep % melodySteps.length];
        const melOsc = this.ctx.createOscillator();
        const melGain = this.ctx.createGain();

        melOsc.type = 'triangle';
        melOsc.frequency.setValueAtTime(melodyFreq, now);

        melGain.gain.setValueAtTime(0.08, now);
        melGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        melOsc.connect(melGain);
        melGain.connect(this.ctx.destination);

        melOsc.start(now);
        melOsc.stop(now + 0.3);

        // 2. Play gentle warm bass note on downbeats
        if (this.bgmStep % 4 === 0) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();

          bassOsc.type = 'sine';
          bassOsc.frequency.setValueAtTime(chordNotes[0], now);

          bassGain.gain.setValueAtTime(0.12, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

          bassOsc.connect(bassGain);
          bassGain.connect(this.ctx.destination);

          bassOsc.start(now);
          bassOsc.stop(now + 0.75);
        }

        this.bgmStep++;
      } catch (e) {
        console.warn("BGM tick error:", e);
      }

      this.bgmTimer = setTimeout(tick, 220);
    };

    tick();
  }

  stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  toggleBgm() {
    if (this.bgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

const sounds = new SoundFx();
