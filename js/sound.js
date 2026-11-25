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
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.connect(this.ctx.destination);

      // Warm 2-note crystal chime (E5 -> B5) matching the C-G-Am-F BGM palette
      const chimeNotes = [
        { freq: 659.25, delay: 0, dur: 0.16, peak: 0.14 },
        { freq: 987.77, delay: 0.055, dur: 0.24, peak: 0.12 }
      ];

      chimeNotes.forEach(({ freq, delay, dur, peak }) => {
        const start = now + delay;
        const osc = this.ctx.createOscillator();
        const overtone = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const overtoneGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(freq * 2, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(peak, start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0008, start + dur);

        overtoneGain.gain.setValueAtTime(0.0001, start);
        overtoneGain.gain.linearRampToValueAtTime(peak * 0.18, start + 0.006);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0004, start + dur * 0.65);

        osc.connect(gain);
        overtone.connect(overtoneGain);
        overtoneGain.connect(gain);
        gain.connect(filter);

        osc.start(start);
        overtone.start(start);
        osc.stop(start + dur + 0.02);
        overtone.stop(start + dur + 0.02);
      });
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

  /* ========================================================
   * UNIVERSAL MUSIC PLAYER (YOUTUBE, MP3 / AUDIO FILES & SYNTH BGM)
   * Automatically loops and starts smoothly on mobile/PC.
   * ======================================================== */
  playMusic(customUrl = '') {
    this.stopMusic();
    this.currentMusicUrl = (customUrl || '').trim();

    if (!this.currentMusicUrl) {
      // No custom URL: use built-in happy synthesizer BGM
      this.startBgm();
      return;
    }

    // 1. Check for YouTube URL
    const ytMatch = this.currentMusicUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/i);
    if (ytMatch && ytMatch[1]) {
      this.playYouTubeBgm(ytMatch[1]);
      return;
    }

    // 2. HTML5 Audio (Direct MP3, AAC, WAV or Data URL / Blob)
    this.playAudioElement(this.currentMusicUrl);
  }

  playAudioElement(url) {
    let audio = document.getElementById('bgm-audio-player');
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = 'bgm-audio-player';
      audio.loop = true;
      audio.preload = 'auto';
      document.body.appendChild(audio);
    }

    audio.src = url;
    audio.volume = this.muted ? 0 : 0.45;
    audio.muted = this.muted;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Audio autoplay blocked by browser policy, waiting for first touch:", err);
      });
    }
    this.bgmPlaying = true;
  }

  playYouTubeBgm(videoId) {
    let ytContainer = document.getElementById('yt-bgm-container');
    if (!ytContainer) {
      ytContainer = document.createElement('div');
      ytContainer.id = 'yt-bgm-container';
      ytContainer.style.position = 'fixed';
      ytContainer.style.width = '1px';
      ytContainer.style.height = '1px';
      ytContainer.style.left = '-9999px';
      ytContainer.style.top = '-9999px';
      ytContainer.style.opacity = '0.001';
      ytContainer.style.pointerEvents = 'none';
      document.body.appendChild(ytContainer);
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&enablejsapi=1&origin=${encodeURIComponent(window.location.origin || '*')}`;
    ytContainer.innerHTML = `<iframe id="yt-bgm-iframe" width="100" height="100" src="${embedUrl}" frameborder="0" allow="autoplay; encrypted-media"></iframe>`;
    this.bgmPlaying = true;
  }

  stopMusic() {
    this.stopBgm();

    const audio = document.getElementById('bgm-audio-player');
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    const ytContainer = document.getElementById('yt-bgm-container');
    if (ytContainer) {
      ytContainer.innerHTML = '';
    }

    this.bgmPlaying = false;
  }

  setMute(isMuted) {
    this.muted = isMuted;

    const audio = document.getElementById('bgm-audio-player');
    if (audio) {
      audio.muted = this.muted;
      if (!this.muted && audio.paused) {
        audio.play().catch(() => {});
      }
    }

    const ytIframe = document.getElementById('yt-bgm-iframe');
    if (ytIframe && ytIframe.contentWindow) {
      const func = this.muted ? 'mute' : 'unMute';
      ytIframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func }), '*');
    }

    if (this.ctx && this.ctx.state === 'suspended' && !this.muted) {
      this.ctx.resume();
    }

    return this.muted;
  }

  toggleMute() {
    return this.setMute(!this.muted);
  }

  /**
   * Initializes background audio automatically upon entering the site.
   * If browser autoplay policy blocks unmuted audio before user interaction,
   * resumes instantly on the user's very first touch or click.
   */
  initAutoplay(musicUrl = '') {
    this.playMusic(musicUrl);

    const onUserTouchToPlay = () => {
      this.init();
      const audio = document.getElementById('bgm-audio-player');
      if (audio && audio.paused && !this.muted) {
        audio.play().catch(() => {});
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (!this.currentMusicUrl && !this.bgmPlaying && !this.muted) {
        this.startBgm();
      }
    };

    ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(evt => {
      window.addEventListener(evt, onUserTouchToPlay, { once: true, passive: true });
    });
  }
}

const sounds = new SoundFx();
