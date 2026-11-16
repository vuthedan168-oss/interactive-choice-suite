/**
 * Love Choice Suite - Core Application
 */

class App {
  constructor() {
    this.currentView = 'studio'; // 'studio' | 'player'
    this.isMuted = false;

    // Config state
    this.config = { ...DEFAULT_MODE1_CONFIG };
    this.isCelebrated = false;

    this.init();
  }

  init() {
    this.checkUrlRouting();
    this.bindGlobalEvents();
    this.renderStudioThemePicker();
    this.renderStudioGifGrid();
    this.syncStudioInputs();

    if (this.currentView === 'player') {
      this.launchPlayerView();
    } else {
      this.launchStudioView();
    }
  }

  checkUrlRouting() {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const isPlay = params.get('play') === '1' || params.has('data') || hash.includes('data=');

    if (isPlay) {
      this.currentView = 'player';
      const payload = params.get('data') || hash;
      const decoded = deserializeConfig(payload);
      if (decoded && decoded.config) {
        this.config = { ...this.config, ...decoded.config };
      }
    } else {
      this.currentView = 'studio';
    }
  }

  bindGlobalEvents() {
    // Sound toggle
    const soundToggle = document.getElementById('btn-sound-toggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        this.isMuted = sounds.toggleMute();
        const icon = soundToggle.querySelector('[data-lucide]');
        if (icon) {
          icon.setAttribute('data-lucide', this.isMuted ? 'volume-x' : 'volume-2');
          lucide.createIcons();
        }
        this.showToast(this.isMuted ? 'Đã tắt âm thanh' : 'Đã bật âm thanh');
      });
    }

    // Share link button
    const btnShare = document.getElementById('btn-share-main');
    if (btnShare) {
      btnShare.addEventListener('click', () => this.generateAndCopyShareLink());
    }

    // Play now button in studio
    const btnPlay = document.getElementById('btn-play-preview');
    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        this.launchPlayerView();
      });
    }

    // Back to edit from player view
    const btnBackEdit = document.getElementById('btn-back-to-edit');
    if (btnBackEdit) {
      btnBackEdit.addEventListener('click', () => {
        this.launchStudioView();
      });
    }
  }

  launchStudioView() {
    evasionEngine.detach();
    this.currentView = 'studio';

    const studioContainer = document.getElementById('creator-studio-container');
    const playerContainer = document.getElementById('player-experience-container');
    const playerControls = document.getElementById('player-controls-bar');

    studioContainer.classList.remove('hidden');
    playerContainer.classList.add('hidden');
    if (playerControls) playerControls.classList.add('hidden');

    this.renderBackgroundDecorations(this.config.theme);
    lucide.createIcons();
  }

  launchPlayerView() {
    evasionEngine.detach();
    this.currentView = 'player';

    const studioContainer = document.getElementById('creator-studio-container');
    const playerContainer = document.getElementById('player-experience-container');
    const playerControls = document.getElementById('player-controls-bar');

    studioContainer.classList.add('hidden');
    playerContainer.classList.remove('hidden');
    if (playerControls) playerControls.classList.remove('hidden');

    this.startPlayerGame();
    lucide.createIcons();
  }

  /* ========================================================
   * STUDIO CONTROLS & THEME COLOR PALETTES
   * ======================================================== */
  syncStudioInputs() {
    const questionInput = document.getElementById('m1-question');
    const subtitleInput = document.getElementById('m1-subtitle');
    const targetInput = document.getElementById('m1-target-text');
    const rejectInput = document.getElementById('m1-reject-text');
    const celebTitleInput = document.getElementById('m1-celeb-title');
    const celebMsgInput = document.getElementById('m1-celeb-msg');
    const customGifInput = document.getElementById('m1-custom-gif');

    if (questionInput) questionInput.value = this.config.question;
    if (subtitleInput) subtitleInput.value = this.config.subtitle;
    if (targetInput) targetInput.value = this.config.targetText;
    if (rejectInput) rejectInput.value = this.config.rejectText;
    if (celebTitleInput) celebTitleInput.value = this.config.celebrationTitle;
    if (celebMsgInput) celebMsgInput.value = this.config.celebrationMessage;
    if (customGifInput) customGifInput.value = this.config.celebrationGif;

    const onInput = () => {
      this.config.question = questionInput.value.trim() || DEFAULT_MODE1_CONFIG.question;
      this.config.subtitle = subtitleInput.value.trim();
      this.config.targetText = targetInput.value.trim() || DEFAULT_MODE1_CONFIG.targetText;
      this.config.rejectText = rejectInput.value.trim() || DEFAULT_MODE1_CONFIG.rejectText;
      this.config.celebrationTitle = celebTitleInput.value.trim() || DEFAULT_MODE1_CONFIG.celebrationTitle;
      this.config.celebrationMessage = celebMsgInput.value.trim() || DEFAULT_MODE1_CONFIG.celebrationMessage;
      if (customGifInput.value.trim()) {
        this.config.celebrationGif = customGifInput.value.trim();
      }
    };

    [questionInput, subtitleInput, targetInput, rejectInput, celebTitleInput, celebMsgInput].forEach(inp => {
      if (inp) inp.addEventListener('input', onInput);
    });

    if (customGifInput) {
      customGifInput.addEventListener('change', () => {
        if (customGifInput.value.trim()) {
          this.config.celebrationGif = customGifInput.value.trim();
          this.highlightSelectedGif();
        }
      });
    }
  }

  renderStudioThemePicker() {
    const container = document.getElementById('m1-theme-picker');
    if (!container) return;
    container.innerHTML = '';

    Object.keys(THEMES).forEach(themeKey => {
      const theme = THEMES[themeKey];
      const isSelected = this.config.theme === themeKey;

      const card = document.createElement('div');
      card.className = `p-4 rounded-2xl border cursor-pointer transition-all ${
        isSelected
          ? 'bg-white/10 border-pink-400 ring-2 ring-pink-400/50 shadow-xl'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
      }`;

      // Build Color Swatches HTML
      const swatchesHtml = theme.swatches.map(color => `
        <span class="w-5 h-5 rounded-full shadow-md border border-white/20 inline-block" style="background-color: ${color}"></span>
      `).join('');

      // Build Decorations Preview HTML
      const decoHtml = theme.decorations.slice(0, 4).join(' ');

      card.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg bg-gradient-to-br ${theme.bgGradient} border border-white/20 shadow-md">
              <i data-lucide="${theme.icon}" class="w-5 h-5 text-white"></i>
            </div>
            <div>
              <div class="text-sm font-black text-white flex items-center gap-2">
                <span>${theme.name}</span>
                ${isSelected ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-500 text-white">Đang chọn</span>' : ''}
              </div>
              <div class="text-xs text-slate-300 mt-0.5">${theme.desc}</div>
            </div>
          </div>
        </div>

        <!-- Color Palette Preview Strip -->
        <div class="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="text-[11px] font-bold text-slate-400 mr-1">Bảng màu:</span>
            ${swatchesHtml}
          </div>
          <div class="text-sm tracking-widest opacity-80 select-none">
            ${decoHtml}
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.config.theme = themeKey;
        this.renderStudioThemePicker();
        this.renderBackgroundDecorations(themeKey);
        this.showToast(`✨ Đã đổi chủ đề: ${theme.name}`);
      });

      container.appendChild(card);
    });

    lucide.createIcons();
  }

  renderStudioGifGrid() {
    const grid = document.getElementById('m1-gif-grid');
    if (!grid) return;
    grid.innerHTML = '';

    CURATED_GIFS.forEach(gif => {
      const isSelected = this.config.celebrationGif === gif.url;
      const card = document.createElement('div');
      card.className = `cursor-pointer rounded-xl overflow-hidden border relative group transition-all ${
        isSelected
          ? 'border-pink-500 ring-2 ring-pink-500 scale-[1.02]'
          : 'border-white/10 opacity-75 hover:opacity-100 hover:border-white/30'
      }`;
      card.innerHTML = `
        <div class="h-24 bg-slate-900 overflow-hidden relative">
          <img src="${gif.url}" alt="${gif.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div class="absolute bottom-1 right-1 bg-black/70 backdrop-blur-sm text-[9px] text-white px-1.5 py-0.5 rounded font-medium">
            ${gif.tag}
          </div>
        </div>
        <div class="p-1.5 bg-slate-900/90 text-[11px] font-medium text-slate-300 truncate">
          ${gif.title}
        </div>
      `;
      card.addEventListener('click', () => {
        this.config.celebrationGif = gif.url;
        const customGifInput = document.getElementById('m1-custom-gif');
        if (customGifInput) customGifInput.value = gif.url;
        this.renderStudioGifGrid();
      });
      grid.appendChild(card);
    });
  }

  highlightSelectedGif() {
    this.renderStudioGifGrid();
  }

  /* ========================================================
   * FLOATING PARTICLES DECORATIONS
   * ======================================================== */
  renderBackgroundDecorations(themeKey) {
    const container = document.getElementById('bg-decorations-container');
    if (!container) return;
    container.innerHTML = '';

    const theme = THEMES[themeKey] || THEMES.love;
    const icons = theme.decorations || ["❤️", "💖", "💕", "💗"];

    // Generate 16 gentle floating symbols across screen
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('div');
      p.className = 'floating-particle';
      const icon = icons[i % icons.length];
      p.textContent = icon;

      const leftPercent = Math.random() * 92 + 4; // 4% to 96%
      const duration = Math.random() * 7 + 8;     // 8s to 15s
      const delay = Math.random() * 8;            // 0s to 8s
      const size = Math.random() * 16 + 18;       // 18px to 34px

      p.style.left = `${leftPercent}%`;
      p.style.animationDuration = `${duration}s`;
      p.style.animationDelay = `-${delay}s`;
      p.style.fontSize = `${size}px`;

      container.appendChild(p);
    }
  }

  /* ========================================================
   * PLAYER VIEW GAMEPLAY & BOUNDARY CONTAINMENT
   * ======================================================== */
  startPlayerGame() {
    evasionEngine.detach();
    const playerContainer = document.getElementById('player-experience-container');
    const theme = THEMES[this.config.theme] || THEMES.love;

    this.renderBackgroundDecorations(this.config.theme);

    playerContainer.className = `min-h-[82vh] flex items-center justify-center p-4 transition-colors duration-500 bg-gradient-to-br ${theme.bgGradient} relative z-10`;

    playerContainer.innerHTML = `
      <div id="m1-game-box" class="w-full max-w-xl mx-auto rounded-3xl p-8 md:p-12 text-center border ${theme.cardBorder} ${theme.cardBg} shadow-2xl relative overflow-visible min-h-[380px] md:min-h-[420px] flex flex-col justify-between">
        
        <!-- Header Tag -->
        <div>
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.badgeColor} border text-xs font-bold uppercase tracking-wider mb-5">
            <i data-lucide="${theme.icon}" class="w-3.5 h-3.5"></i>
            <span>${theme.name}</span>
          </div>

          <!-- Question Title -->
          <h1 id="m1-display-question" class="text-2xl md:text-4xl font-black text-white mb-3 leading-tight select-none">
            ${this.escapeHtml(this.config.question)}
          </h1>

          <!-- Subtitle -->
          ${this.config.subtitle ? `<p class="text-sm md:text-base text-slate-300 mb-8 max-w-md mx-auto select-none">${this.escapeHtml(this.config.subtitle)}</p>` : '<div class="mb-6"></div>'}
        </div>

        <!-- Buttons Arena: Runaway button jumps strictly inside this game card! -->
        <div id="m1-buttons-arena" class="relative min-h-[140px] flex items-center justify-center gap-6 md:gap-8 my-auto">
          
          <!-- Target Button (Forced Choice) -->
          <button id="m1-target-btn" type="button" class="relative z-10 px-8 py-4 rounded-2xl font-black text-lg md:text-xl transition-all transform hover:scale-105 active:scale-95 shadow-xl ${theme.targetBtnClass}">
            ${this.escapeHtml(this.config.targetText)}
          </button>

          <!-- Reject Button (Runaway Choice) -->
          <button id="m1-reject-btn" type="button" class="px-7 py-3.5 rounded-2xl font-bold text-base md:text-lg transition-all ${theme.rejectBtnClass} backdrop-blur-md">
            ${this.escapeHtml(this.config.rejectText)}
          </button>
        </div>

        <!-- Hint Footer -->
        <div class="text-xs text-slate-400 flex items-center justify-center gap-1.5 select-none pt-4">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-pink-400"></i>
          <span>Hãy chọn câu trả lời thật lòng từ trái tim nhé!</span>
        </div>
      </div>
    `;

    lucide.createIcons();

    const rejectBtn = document.getElementById('m1-reject-btn');
    const targetBtn = document.getElementById('m1-target-btn');

    // Attach Evasion Engine to Reject button
    evasionEngine.attach(rejectBtn, {
      proximityRadius: window.innerWidth < 768 ? 60 : 80,
      quips: DEFAULT_RUNAWAY_QUIPS
    });

    // Clicking Target Button triggers Celebration
    targetBtn.onclick = () => {
      evasionEngine.detach();
      this.celebratePlayer();
    };
  }

  celebratePlayer() {
    sounds.playSuccess();
    this.triggerConfetti();

    const gameBox = document.getElementById('m1-game-box');
    const theme = THEMES[this.config.theme] || THEMES.love;

    gameBox.innerHTML = `
      <div class="space-y-6 animate-pop-in my-auto">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.badgeColor} border text-xs font-bold uppercase tracking-wider">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
          <span>Lựa Chọn Tuyệt Vời Nhất!</span>
        </div>

        <h2 class="text-2xl md:text-4xl font-black text-white leading-tight">
          ${this.escapeHtml(this.config.celebrationTitle)}
        </h2>

        <!-- Celebration GIF -->
        <div class="w-full max-w-sm mx-auto h-64 rounded-2xl overflow-hidden border-2 ${theme.cardBorder} shadow-2xl relative bg-slate-950">
          <img src="${this.config.celebrationGif}" alt="Celebration GIF" class="w-full h-full object-cover" onerror="this.src='https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif'" />
        </div>

        <p class="text-base md:text-lg text-slate-200 leading-relaxed max-w-md mx-auto">
          ${this.escapeHtml(this.config.celebrationMessage)}
        </p>

        <div class="pt-4 flex items-center justify-center gap-4">
          <button id="m1-replay-btn" type="button" class="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2">
            <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
            <span>Chơi lại</span>
          </button>
          <button id="m1-share-btn" type="button" class="px-6 py-3 rounded-xl ${theme.targetBtnClass} font-bold text-sm transition-all flex items-center gap-2">
            <i data-lucide="share-2" class="w-4 h-4"></i>
            <span>Gửi câu này cho người khác</span>
          </button>
        </div>
      </div>
    `;

    lucide.createIcons();

    document.getElementById('m1-replay-btn').onclick = () => {
      this.startPlayerGame();
    };

    document.getElementById('m1-share-btn').onclick = () => {
      this.generateAndCopyShareLink();
    };
  }

  /* ========================================================
   * SHARING & QR CODE FOR MOBILE & PC
   * ======================================================== */
  generateAndCopyShareLink() {
    const serialized = serializeConfig('love', this.config);
    if (!serialized) {
      alert('Lỗi tạo link chia sẻ!');
      return;
    }

    const publicBase = 'https://vuthedan168-oss.github.io/interactive-choice-suite/';
    const shareUrl = `${publicBase}?play=1&data=${serialized}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }

    this.openShareModal(shareUrl);
  }

  openShareModal(shareUrl) {
    const modal = document.getElementById('modal-share-link');
    const input = document.getElementById('share-url-input');
    const qrImg = document.getElementById('share-qr-image');
    const openBtn = document.getElementById('btn-open-share-link');
    const copyBtn = document.getElementById('btn-copy-modal-link');

    if (input) input.value = shareUrl;
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareUrl)}`;
    }
    if (openBtn) {
      openBtn.onclick = () => window.open(shareUrl, '_blank');
    }
    if (copyBtn) {
      copyBtn.onclick = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareUrl).then(() => {
            this.showToast('🎉 Đã sao chép link người chơi!');
          });
        } else {
          input.select();
          document.execCommand('copy');
          this.showToast('🎉 Đã sao chép link người chơi!');
        }
      };
    }

    if (modal) {
      modal.classList.remove('hidden');
    }
    this.showToast('🎉 Đã tạo link người chơi dùng được trên cả điện thoại!');
  }

  showToast(message) {
    const toast = document.getElementById('toast-notification');
    const toastText = document.getElementById('toast-text');
    if (!toast || !toastText) return;

    toastText.textContent = message;
    toast.classList.remove('hidden', 'translate-y-12', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.add('translate-y-12', 'opacity-0');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3500);
  }

  triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.appInstance = new App();
});
