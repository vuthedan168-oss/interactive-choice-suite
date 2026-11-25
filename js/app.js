/**
 * Choice Arena - Core Application
 * Mode 1: Lựa Chọn Định Mệnh (Fate Choice)
 * Mode 2: Đại Chiến Ngôi Sao (Star Clash)
 */

class App {
  constructor() {
    this.currentMode = 'mode1'; // 'mode1' | 'mode2'
    this.currentView = 'studio'; // 'studio' | 'player'
    this.isMuted = false;

    // Mode 1: Lựa Chọn Định Mệnh State
    this.mode1Config = { ...DEFAULT_MODE1_CONFIG };

    // Mode 2: Đại Chiến Ngôi Sao State
    this.mode2Config = {
      title: DEFAULT_MODE2_CONFIG.title,
      subtitle: DEFAULT_MODE2_CONFIG.subtitle,
      roster: JSON.parse(JSON.stringify(DEFAULT_MODE2_CONFIG.roster)),
      riggedWinnerId: "",
      riggedFinalBoss: true,
      musicUrl: ""
    };
    this.mode2Game = {
      queue: [],
      candidate1: null,
      candidate2: null,
      roundNumber: 1,
      totalRounds: 1,
      isFinished: false,
      winner: null
    };

    this.debouncedSaveStudio = this.debounce(() => this.saveStudioProgress(), 350);

    this.init();
  }

  /* ========================================================
   * PROGRESS PERSISTENCE (LOCAL STORAGE)
   * ======================================================== */
  saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        try {
          const clone = JSON.parse(JSON.stringify(value));
          if (clone.musicUrl && clone.musicUrl.startsWith('data:audio')) {
            clone.musicUrl = '';
          }
          localStorage.setItem(key, JSON.stringify(clone));
          return true;
        } catch (e2) {
          console.warn('Quota exceeded after stripping audio data', e2);
          this.showToast('⚠️ Bộ nhớ trình duyệt đã đầy, hãy dùng ảnh dung lượng vừa phải hơn!');
        }
      }
      console.warn('LocalStorage save error', e);
      return false;
    }
  }

  loadFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('LocalStorage load error', e);
      return null;
    }
  }

  removeFromStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }

  debounce(fn, delay = 350) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  loadStudioProgress() {
    const saved1 = this.loadFromStorage('love_choice_v2_studio_m1');
    if (saved1 && typeof saved1 === 'object') {
      this.mode1Config = { ...DEFAULT_MODE1_CONFIG, ...saved1 };
    }

    const saved2 = this.loadFromStorage('love_choice_v2_studio_m2');
    if (saved2 && typeof saved2 === 'object') {
      this.mode2Config = {
        title: saved2.title || DEFAULT_MODE2_CONFIG.title,
        subtitle: saved2.subtitle || DEFAULT_MODE2_CONFIG.subtitle,
        roster: Array.isArray(saved2.roster) && saved2.roster.length >= 2 ? saved2.roster : JSON.parse(JSON.stringify(DEFAULT_MODE2_CONFIG.roster)),
        riggedWinnerId: saved2.riggedWinnerId || "",
        riggedFinalBoss: saved2.riggedFinalBoss !== undefined ? saved2.riggedFinalBoss : true,
        musicUrl: saved2.musicUrl || DEFAULT_MODE2_CONFIG.musicUrl || ""
      };
    }

    const savedActiveMode = localStorage.getItem('love_choice_v2_active_mode');
    if (savedActiveMode === 'mode1' || savedActiveMode === 'mode2') {
      this.currentMode = savedActiveMode;
    }
  }

  saveStudioProgress() {
    this.readCurrentStudioInputs(this.currentMode);
    this.saveToStorage('love_choice_v2_studio_m1', this.mode1Config);
    this.saveToStorage('love_choice_v2_studio_m2', this.mode2Config);
    try {
      localStorage.setItem('love_choice_v2_active_mode', this.currentMode);
    } catch (e) {}
    this.showSaveIndicator();
  }

  showSaveIndicator() {
    const ind1 = document.getElementById('save-indicator-mode1');
    const ind2 = document.getElementById('save-indicator-mode2');
    [ind1, ind2].forEach(ind => {
      if (!ind) return;
      ind.classList.remove('opacity-0');
      ind.classList.add('opacity-100');
    });
  }

  resetMode1ToDefault() {
    if (confirm('Khôi phục về nội dung câu hỏi mẫu ban đầu của Lựa Chọn Định Mệnh? Mọi sửa đổi trước đó sẽ được làm mới.')) {
      this.mode1Config = { ...DEFAULT_MODE1_CONFIG };
      this.removeFromStorage('love_choice_v2_studio_m1');
      this.syncStudioMode1Inputs();
      this.renderStudioThemePicker();
      this.renderStudioGifGrid();
      this.showToast('✓ Đã khôi phục câu hỏi mẫu mặc định!');
    }
  }

  resetMode2ToDefault() {
    if (confirm('Khôi phục về danh sách 16 người nổi tiếng và cài đặt mẫu ban đầu? Mọi chỉnh sửa trước đó sẽ được làm mới.')) {
      this.mode2Config = {
        title: DEFAULT_MODE2_CONFIG.title,
        subtitle: DEFAULT_MODE2_CONFIG.subtitle,
        roster: JSON.parse(JSON.stringify(DEFAULT_MODE2_CONFIG.roster)),
        riggedWinnerId: "",
        riggedFinalBoss: true,
        musicUrl: DEFAULT_MODE2_CONFIG.musicUrl || ""
      };
      this.removeFromStorage('love_choice_v2_studio_m2');
      this.renderStudioMode2();
      this.showToast('✓ Đã khôi phục danh sách mẫu mặc định!');
    }
  }

  getMode2GameStorageKey() {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('p') || params.get('data') || window.location.hash || '';
    if (dataParam) {
      let hash = 0;
      for (let i = 0; i < dataParam.length; i++) {
        hash = ((hash << 5) - hash) + dataParam.charCodeAt(i);
        hash |= 0;
      }
      return `love_choice_v2_play_m2_${Math.abs(hash)}`;
    }
    return 'love_choice_v2_play_m2_local';
  }

  saveMode2GameProgress() {
    if (!this.mode2Game) return;
    this.saveToStorage(this.getMode2GameStorageKey(), this.mode2Game);
  }

  clearMode2GameProgress() {
    this.removeFromStorage(this.getMode2GameStorageKey());
  }

  getMode1GameStorageKey() {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('p') || params.get('data') || window.location.hash || '';
    if (dataParam) {
      let hash = 0;
      for (let i = 0; i < dataParam.length; i++) {
        hash = ((hash << 5) - hash) + dataParam.charCodeAt(i);
        hash |= 0;
      }
      return `love_choice_v2_play_m1_${Math.abs(hash)}`;
    }
    return 'love_choice_v2_play_m1_local';
  }

  async init() {
    const routeInfo = this.checkUrlRouting();
    if (this.currentView === 'studio') {
      this.loadStudioProgress();
    }
    this.bindGlobalEvents();

    if (routeInfo && routeInfo.pasteKey) {
      const studioContainer = document.getElementById('creator-studio-container');
      const playerContainer = document.getElementById('player-experience-container');
      const studioTabs = document.getElementById('studio-mode-tabs');
      if (studioContainer) studioContainer.classList.add('hidden');
      if (studioTabs) studioTabs.classList.add('hidden');
      if (playerContainer) {
        playerContainer.classList.remove('hidden');
        playerContainer.className = 'min-h-[82vh] flex items-center justify-center p-4 bg-slate-950 relative z-10';
        playerContainer.innerHTML = `
          <div class="glass-panel rounded-3xl p-8 text-center border border-white/10 max-w-sm w-full space-y-3">
            <div class="w-10 h-10 mx-auto rounded-full border-4 border-amber-400/30 border-t-amber-400 animate-spin"></div>
            <div class="text-sm font-bold text-white">Đang tải dữ liệu trận đấu...</div>
            <div class="text-xs text-slate-400">Giữ nguyên ảnh HD sắc nét</div>
          </div>
        `;
      }

      const remoteDecoded = await this.fetchCloudConfig(routeInfo.pasteKey);
      if (remoteDecoded && remoteDecoded.config) {
        if (remoteDecoded.type === 'mode2') {
          this.currentMode = 'mode2';
          this.mode2Config = { ...this.mode2Config, ...remoteDecoded.config };
        } else {
          this.currentMode = 'mode1';
          this.mode1Config = { ...this.mode1Config, ...remoteDecoded.config };
        }
      } else if (!routeInfo.hasInlineData && playerContainer) {
        playerContainer.innerHTML = `
          <div class="glass-panel rounded-3xl p-8 text-center border border-rose-500/40 max-w-md w-full space-y-4">
            <div class="text-2xl">⚠️</div>
            <div class="text-base font-black text-white">Không tải được dữ liệu chia sẻ</div>
            <p class="text-xs text-slate-300">Link có thể đã hết hạn hoặc mạng đang chặn kết nối. Vui lòng thử lại.</p>
            <div class="flex items-center justify-center gap-3 pt-2">
              <button type="button" onclick="window.location.reload()" class="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs">Thử lại</button>
              <button type="button" onclick="document.getElementById('btn-brand-home').click()" class="px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs border border-white/20">Mở Studio</button>
            </div>
          </div>
        `;
        return;
      }
    }

    this.renderStudioThemePicker();
    this.renderStudioGifGrid();
    this.syncStudioMode1Inputs();
    this.renderStudioMode2();

    const initialMusic = this.currentMode === 'mode2' ? this.mode2Config.musicUrl : this.mode1Config.musicUrl;
    sounds.initAutoplay(initialMusic);

    if (this.currentView === 'player') {
      this.launchPlayerView();
    } else {
      this.switchStudioMode(this.currentMode);
    }
  }

  checkUrlRouting() {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const pasteKey = params.get('p');
    const isPlay = params.get('play') === '1' || params.has('data') || !!pasteKey || hash.includes('data=');

    if (isPlay) {
      this.currentView = 'player';
      let payload = params.get('data');
      if (!payload && hash) {
        const cleanHash = hash.replace(/^#/, '');
        const hashParams = new URLSearchParams(cleanHash);
        payload = hashParams.get('data') || cleanHash;
      }
      if (!payload && !pasteKey) {
        payload = window.location.search || hash;
      }

      const decoded = payload ? deserializeConfig(payload) : null;
      if (decoded && decoded.config) {
        if (decoded.type === 'mode2') {
          this.currentMode = 'mode2';
          this.mode2Config = { ...this.mode2Config, ...decoded.config };
        } else {
          this.currentMode = 'mode1';
          this.mode1Config = { ...this.mode1Config, ...decoded.config };
        }
      } else if (params.get('mode') === 'mode2') {
        this.currentMode = 'mode2';
      }

      return { pasteKey, hasInlineData: !!(decoded && decoded.config) };
    } else {
      this.currentView = 'studio';
      const modeParam = params.get('mode');
      if (modeParam === 'mode2') this.currentMode = 'mode2';
      return { pasteKey: null, hasInlineData: false };
    }
  }

  bindGlobalEvents() {
    // Single Speaker Sound & Music toggle
    const soundToggle = document.getElementById('btn-sound-toggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        this.isMuted = sounds.toggleMute();
        const icon = soundToggle.querySelector('[data-lucide]');
        if (icon) {
          icon.setAttribute('data-lucide', this.isMuted ? 'volume-x' : 'volume-2');
          lucide.createIcons();
        }
        this.showToast(this.isMuted ? '🔇 Đã tắt âm thanh' : '🎵 Đã bật âm thanh');
      });
    }

    // Brand Logo Button (Click to open Giao Diện Tạo Thiệp)
    const btnBrandHome = document.getElementById('btn-brand-home');
    if (btnBrandHome) {
      btnBrandHome.addEventListener('click', () => {
        evasionEngine.detach();
        const url = new URL(window.location.href);
        url.search = '';
        url.hash = '';
        window.history.pushState({}, '', url.toString());
        this.loadStudioProgress();
        this.launchStudioView();
      });
    }

    // Reset to default buttons
    const btnResetM1 = document.getElementById('btn-reset-mode1');
    if (btnResetM1) btnResetM1.addEventListener('click', () => this.resetMode1ToDefault());

    const btnResetM2 = document.getElementById('btn-reset-mode2');
    if (btnResetM2) btnResetM2.addEventListener('click', () => this.resetMode2ToDefault());

    // Studio Mode Switcher Tabs
    const tabMode1 = document.getElementById('tab-mode1');
    const tabMode2 = document.getElementById('tab-mode2');
    if (tabMode1) tabMode1.addEventListener('click', () => this.switchStudioMode('mode1'));
    if (tabMode2) tabMode2.addEventListener('click', () => this.switchStudioMode('mode2'));

    // Share link buttons
    const btnShareMode1 = document.getElementById('btn-share-mode1');
    if (btnShareMode1) btnShareMode1.addEventListener('click', () => this.generateAndCopyShareLink('mode1'));

    const btnShareMode2 = document.getElementById('btn-share-mode2');
    if (btnShareMode2) btnShareMode2.addEventListener('click', () => this.generateAndCopyShareLink('mode2'));

    // Play now buttons
    const btnPlayMode1 = document.getElementById('btn-play-mode1');
    if (btnPlayMode1) btnPlayMode1.addEventListener('click', () => this.previewAsPlayer('mode1'));

    const btnPlayMode2 = document.getElementById('btn-play-mode2');
    if (btnPlayMode2) btnPlayMode2.addEventListener('click', () => this.previewAsPlayer('mode2'));

    // Secondary / Bottom action buttons
    document.querySelectorAll('.btn-play-mode1-alt').forEach(btn => {
      btn.addEventListener('click', () => this.previewAsPlayer('mode1'));
    });
    document.querySelectorAll('.btn-share-mode1-alt').forEach(btn => {
      btn.addEventListener('click', () => this.generateAndCopyShareLink('mode1'));
    });
    document.querySelectorAll('.btn-play-mode2-alt').forEach(btn => {
      btn.addEventListener('click', () => this.previewAsPlayer('mode2'));
    });
    document.querySelectorAll('.btn-share-mode2-alt').forEach(btn => {
      btn.addEventListener('click', () => this.generateAndCopyShareLink('mode2'));
    });
  }

  launchStudioView() {
    evasionEngine.detach();
    this.currentView = 'studio';

    const studioContainer = document.getElementById('creator-studio-container');
    const playerContainer = document.getElementById('player-experience-container');
    const studioTabs = document.getElementById('studio-mode-tabs');

    studioContainer.classList.remove('hidden');
    playerContainer.classList.add('hidden');
    if (studioTabs) studioTabs.classList.remove('hidden');

    this.syncStudioMode1Inputs();
    this.renderStudioThemePicker();
    this.renderStudioGifGrid();
    this.renderStudioMode2();
    this.switchStudioMode(this.currentMode);
  }

  switchStudioMode(mode) {
    this.currentMode = mode;
    try {
      localStorage.setItem('love_choice_v2_active_mode', mode);
    } catch (e) {}
    evasionEngine.detach();

    const tabMode1 = document.getElementById('tab-mode1');
    const tabMode2 = document.getElementById('tab-mode2');
    const panelMode1 = document.getElementById('studio-panel-mode1');
    const panelMode2 = document.getElementById('studio-panel-mode2');
    const studioContainer = document.getElementById('creator-studio-container');
    const playerContainer = document.getElementById('player-experience-container');
    const studioTabs = document.getElementById('studio-mode-tabs');

    studioContainer.classList.remove('hidden');
    playerContainer.classList.add('hidden');
    if (studioTabs) studioTabs.classList.remove('hidden');

    if (mode === 'mode1') {
      tabMode1.className = 'flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30 transition-all';
      tabMode2.className = 'flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all';
      panelMode1.classList.remove('hidden');
      panelMode2.classList.add('hidden');
      this.renderBackgroundDecorations(this.mode1Config.theme);
      sounds.playMusic(this.mode1Config.musicUrl);
    } else {
      tabMode2.className = 'flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/30 transition-all';
      tabMode1.className = 'flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all';
      panelMode1.classList.add('hidden');
      panelMode2.classList.remove('hidden');
      this.renderBackgroundDecorations('luxury');
      sounds.playMusic(this.mode2Config.musicUrl);
    }

    lucide.createIcons();
  }

  /* ========================================================
   * MODE 1: BẪY TÌNH YÊU STUDIO
   * ======================================================== */
  syncStudioMode1Inputs() {
    const questionInput = document.getElementById('m1-question');
    const subtitleInput = document.getElementById('m1-subtitle');
    const targetInput = document.getElementById('m1-target-text');
    const rejectInput = document.getElementById('m1-reject-text');
    const celebTitleInput = document.getElementById('m1-celeb-title');
    const celebMsgInput = document.getElementById('m1-celeb-msg');
    const customGifInput = document.getElementById('m1-custom-gif');
    const musicUrlInput = document.getElementById('m1-music-url');
    const musicFileInput = document.getElementById('m1-music-file');
    const musicStatusText = document.getElementById('m1-music-status-text');
    const btnClearMusic = document.getElementById('btn-m1-clear-music');

    if (questionInput) questionInput.value = this.mode1Config.question;
    if (subtitleInput) subtitleInput.value = this.mode1Config.subtitle;
    if (targetInput) targetInput.value = this.mode1Config.targetText;
    if (rejectInput) rejectInput.value = this.mode1Config.rejectText;
    if (celebTitleInput) celebTitleInput.value = this.mode1Config.celebrationTitle;
    if (celebMsgInput) celebMsgInput.value = this.mode1Config.celebrationMessage;
    if (customGifInput) customGifInput.value = this.mode1Config.celebrationGif;

    const updateMode1MusicStatus = () => {
      const url = (this.mode1Config.musicUrl || '').trim();
      if (musicUrlInput) musicUrlInput.value = url.startsWith('data:audio') ? '[File nhạc đã tải lên]' : url;
      if (musicStatusText) {
        if (!url) {
          musicStatusText.textContent = 'Đang dùng: Nhạc vui tươi mặc định (tự động phát)';
          if (btnClearMusic) btnClearMusic.classList.add('hidden');
        } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
          musicStatusText.textContent = 'Đang dùng: Nhạc YouTube (tự động phát)';
          if (btnClearMusic) btnClearMusic.classList.remove('hidden');
        } else if (url.startsWith('data:audio') || url.startsWith('blob:')) {
          musicStatusText.textContent = 'Đang dùng: File nhạc đã tải lên (tự động phát)';
          if (btnClearMusic) btnClearMusic.classList.remove('hidden');
        } else {
          musicStatusText.textContent = 'Đang dùng: Link nhạc trực tuyến (tự động phát)';
          if (btnClearMusic) btnClearMusic.classList.remove('hidden');
        }
      }
    };

    updateMode1MusicStatus();

    const onInput = () => {
      this.mode1Config.question = questionInput.value.trim() || DEFAULT_MODE1_CONFIG.question;
      this.mode1Config.subtitle = subtitleInput.value.trim();
      this.mode1Config.targetText = targetInput.value.trim() || DEFAULT_MODE1_CONFIG.targetText;
      this.mode1Config.rejectText = rejectInput.value.trim() || DEFAULT_MODE1_CONFIG.rejectText;
      this.mode1Config.celebrationTitle = celebTitleInput.value.trim() || DEFAULT_MODE1_CONFIG.celebrationTitle;
      this.mode1Config.celebrationMessage = celebMsgInput.value.trim() || DEFAULT_MODE1_CONFIG.celebrationMessage;
      if (customGifInput.value.trim()) {
        this.mode1Config.celebrationGif = customGifInput.value.trim();
      }
      this.debouncedSaveStudio();
    };

    [questionInput, subtitleInput, targetInput, rejectInput, celebTitleInput, celebMsgInput].forEach(inp => {
      if (inp) inp.addEventListener('input', onInput);
    });

    if (customGifInput) {
      customGifInput.addEventListener('change', () => {
        if (customGifInput.value.trim()) {
          this.mode1Config.celebrationGif = customGifInput.value.trim();
          this.renderStudioGifGrid();
          this.saveStudioProgress();
        }
      });
    }

    if (musicUrlInput) {
      musicUrlInput.addEventListener('input', () => {
        const val = musicUrlInput.value.trim();
        this.mode1Config.musicUrl = val;
        updateMode1MusicStatus();
        this.debouncedSaveStudio();
      });
      musicUrlInput.addEventListener('change', () => {
        const val = musicUrlInput.value.trim();
        this.mode1Config.musicUrl = val;
        updateMode1MusicStatus();
        sounds.playMusic(val);
        this.saveStudioProgress();
      });
    }

    if (musicFileInput) {
      musicFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            this.mode1Config.musicUrl = loadEvt.target.result;
            updateMode1MusicStatus();
            sounds.playMusic(this.mode1Config.musicUrl);
            this.saveStudioProgress();
            this.showToast('🎵 Đã tải file nhạc lên thành công!');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (btnClearMusic) {
      btnClearMusic.addEventListener('click', () => {
        this.mode1Config.musicUrl = '';
        if (musicFileInput) musicFileInput.value = '';
        updateMode1MusicStatus();
        sounds.playMusic('');
        this.saveStudioProgress();
        this.showToast('Đã khôi phục nhạc mặc định');
      });
    }
  }

  renderStudioThemePicker() {
    const container = document.getElementById('m1-theme-picker');
    if (!container) return;
    container.innerHTML = '';

    Object.keys(THEMES).forEach(themeKey => {
      const theme = THEMES[themeKey];
      const isSelected = this.mode1Config.theme === themeKey;

      const card = document.createElement('div');
      card.className = `p-4 rounded-2xl border cursor-pointer transition-all ${
        isSelected
          ? 'bg-white/10 border-pink-400 ring-2 ring-pink-400/50 shadow-xl'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
      }`;

      const swatchesHtml = theme.swatches.map(color => `
        <span class="w-5 h-5 rounded-full shadow-md border border-white/20 inline-block shrink-0" style="background-color: ${color}"></span>
      `).join('');

      const decoHtml = theme.decorations.slice(0, 4).join(' ');

      card.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg bg-gradient-to-br ${theme.bgGradient} border border-white/20 shadow-md shrink-0">
              <i data-lucide="${theme.icon}" class="w-5 h-5 text-white"></i>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1.5 flex-wrap">
                <span class="text-sm font-black text-white leading-tight">${theme.name}</span>
                ${isSelected ? '<span class="shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pink-500 text-white shadow-sm">Đang chọn</span>' : ''}
              </div>
              <div class="text-xs text-slate-300 mt-0.5 leading-snug">${theme.desc}</div>
            </div>
          </div>
        </div>

        <div class="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-[11px] font-bold text-slate-400 mr-1">Bảng màu:</span>
            ${swatchesHtml}
          </div>
          <div class="text-sm tracking-widest opacity-80 select-none shrink-0">
            ${decoHtml}
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.mode1Config.theme = themeKey;
        this.renderStudioThemePicker();
        this.renderBackgroundDecorations(themeKey);
        this.saveStudioProgress();
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
      const isSelected = this.mode1Config.celebrationGif === gif.url;
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
        this.mode1Config.celebrationGif = gif.url;
        const customGifInput = document.getElementById('m1-custom-gif');
        if (customGifInput) customGifInput.value = gif.url;
        this.renderStudioGifGrid();
        this.saveStudioProgress();
      });
      grid.appendChild(card);
    });
  }

  /* ========================================================
   * MODE 2: ĐẠI CHIẾN NGÔI SAO STUDIO & ROSTER
   * ======================================================== */
  renderStudioMode2() {
    const titleInput = document.getElementById('m2-title');
    const subtitleInput = document.getElementById('m2-subtitle');
    const riggedSelect = document.getElementById('m2-rigged-winner');
    const riggedFinalBossCheck = document.getElementById('m2-final-boss-toggle');

    if (titleInput) {
      titleInput.value = this.mode2Config.title;
      titleInput.addEventListener('input', () => {
        this.mode2Config.title = titleInput.value.trim() || DEFAULT_MODE2_CONFIG.title;
        this.debouncedSaveStudio();
      });
    }

    if (subtitleInput) {
      subtitleInput.value = this.mode2Config.subtitle;
      subtitleInput.addEventListener('input', () => {
        this.mode2Config.subtitle = subtitleInput.value.trim() || DEFAULT_MODE2_CONFIG.subtitle;
        this.debouncedSaveStudio();
      });
    }

    if (riggedFinalBossCheck) {
      riggedFinalBossCheck.checked = this.mode2Config.riggedFinalBoss;
      riggedFinalBossCheck.addEventListener('change', () => {
        this.mode2Config.riggedFinalBoss = riggedFinalBossCheck.checked;
        this.saveStudioProgress();
      });
    }

    // Populate Rigged Winner Dropdown
    if (riggedSelect) {
      riggedSelect.innerHTML = '<option value="">-- Chơi công bằng (Không chỉ định người thắng) --</option>';
      this.mode2Config.roster.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `👑 ${c.name} (${c.field})`;
        if (this.mode2Config.riggedWinnerId === c.id) {
          opt.selected = true;
        }
        riggedSelect.appendChild(opt);
      });

      riggedSelect.addEventListener('change', () => {
        this.mode2Config.riggedWinnerId = riggedSelect.value;
        this.saveStudioProgress();
        this.renderStudioMode2Roster();
      });
    }

    // Add Candidate Button
    const btnOpenAddModal = document.getElementById('btn-open-add-candidate');
    if (btnOpenAddModal) {
      btnOpenAddModal.onclick = () => this.openCandidateModal(null);
    }

    // Quick Add "ME" as Final Boss
    const btnAddMeAsBoss = document.getElementById('btn-add-me-boss');
    if (btnAddMeAsBoss) {
      btnAddMeAsBoss.onclick = () => this.addCreatorAsFinalBoss();
    }

    // Reset Roster
    const btnResetRoster = document.getElementById('btn-reset-roster');
    if (btnResetRoster) {
      btnResetRoster.onclick = () => {
        if (confirm('Khôi phục danh sách 16 thần tượng mặc định ban đầu?')) {
          this.mode2Config.roster = JSON.parse(JSON.stringify(DEFAULT_CELEBRITIES));
          this.mode2Config.riggedWinnerId = "";
          this.saveStudioProgress();
          this.renderStudioMode2();
          this.showToast('Đã khôi phục danh sách mặc định!');
        }
      };
    }

    // Music Controls for Mode 2
    const m2MusicUrlInput = document.getElementById('m2-music-url');
    const m2MusicFileInput = document.getElementById('m2-music-file');
    const m2MusicStatusText = document.getElementById('m2-music-status-text');
    const btnM2ClearMusic = document.getElementById('btn-m2-clear-music');

    const updateMode2MusicStatus = () => {
      const url = (this.mode2Config.musicUrl || '').trim();
      if (m2MusicUrlInput) m2MusicUrlInput.value = url.startsWith('data:audio') ? '[File nhạc đã tải lên]' : url;
      if (m2MusicStatusText) {
        if (!url) {
          m2MusicStatusText.textContent = 'Đang dùng: Nhạc vui tươi mặc định';
          if (btnM2ClearMusic) btnM2ClearMusic.classList.add('hidden');
        } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
          m2MusicStatusText.textContent = 'Đang dùng: Nhạc YouTube';
          if (btnM2ClearMusic) btnM2ClearMusic.classList.remove('hidden');
        } else if (url.startsWith('data:audio') || url.startsWith('blob:')) {
          m2MusicStatusText.textContent = 'Đang dùng: File nhạc đã tải lên';
          if (btnM2ClearMusic) btnM2ClearMusic.classList.remove('hidden');
        } else {
          m2MusicStatusText.textContent = 'Đang dùng: Link nhạc trực tuyến';
          if (btnM2ClearMusic) btnM2ClearMusic.classList.remove('hidden');
        }
      }
    };

    updateMode2MusicStatus();

    if (m2MusicUrlInput) {
      m2MusicUrlInput.addEventListener('input', () => {
        const val = m2MusicUrlInput.value.trim();
        this.mode2Config.musicUrl = val;
        updateMode2MusicStatus();
        this.debouncedSaveStudio();
      });
      m2MusicUrlInput.addEventListener('change', () => {
        const val = m2MusicUrlInput.value.trim();
        this.mode2Config.musicUrl = val;
        updateMode2MusicStatus();
        sounds.playMusic(val);
        this.saveStudioProgress();
      });
    }

    if (m2MusicFileInput) {
      m2MusicFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            this.mode2Config.musicUrl = loadEvt.target.result;
            updateMode2MusicStatus();
            sounds.playMusic(this.mode2Config.musicUrl);
            this.saveStudioProgress();
            this.showToast('🎵 Đã tải file nhạc cho đấu trường!');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (btnM2ClearMusic) {
      btnM2ClearMusic.addEventListener('click', () => {
        this.mode2Config.musicUrl = '';
        if (m2MusicFileInput) m2MusicFileInput.value = '';
        updateMode2MusicStatus();
        sounds.playMusic('');
        this.saveStudioProgress();
        this.showToast('Đã khôi phục nhạc mặc định');
      });
    }

    this.renderStudioMode2Roster();
  }

  renderStudioMode2Roster() {
    const listContainer = document.getElementById('m2-roster-list');
    const countBadge = document.getElementById('m2-candidate-count');
    if (countBadge) {
      countBadge.textContent = `${this.mode2Config.roster.length} người`;
    }

    if (!listContainer) return;
    listContainer.innerHTML = '';

    this.mode2Config.roster.forEach((candidate, index) => {
      const isRigged = this.mode2Config.riggedWinnerId === candidate.id;
      const row = document.createElement('div');
      row.setAttribute('data-candidate-id', candidate.id);
      row.className = `p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
        isRigged
          ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/20'
          : 'bg-slate-900/60 border-white/10 hover:border-white/20'
      }`;

      const initials = candidate.initials || candidate.name.substring(0, 2).toUpperCase();
      const resolvedAvatar = resolveAvatarUrl(candidate.avatar);
      const avatarContent = resolvedAvatar
        ? `<div class="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
             <img src="${resolvedAvatar}" referrerpolicy="no-referrer" loading="lazy" class="w-full h-full object-cover ring-2 ${isRigged ? 'ring-amber-400' : 'ring-white/20'}" onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');" />
             <div class="hidden w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center font-bold text-xs text-white ring-2 ring-amber-400/50">${initials}</div>
           </div>`
        : `<div class="w-10 h-10 rounded-full bg-gradient-to-br ${candidate.color || 'from-amber-500 to-red-600'} flex items-center justify-center font-bold text-xs text-white ring-2 ring-amber-400/50 shrink-0">${initials}</div>`;

      row.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          ${avatarContent}
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-400">#${index + 1}</span>
              <span class="text-sm font-bold text-white truncate ${isRigged ? 'text-amber-300' : ''}">${candidate.name}</span>
              ${isRigged ? '<span class="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950 uppercase">Vua chỉ định</span>' : ''}
            </div>
            <div class="text-xs text-slate-400 truncate">${candidate.field}</div>
          </div>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <!-- Move To Top Button (if not already #1) -->
          ${index > 0 ? `
          <button type="button" class="btn-move-top p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/10 text-xs transition-all" title="Đưa lên đầu (#1 - Đấu ngay Vòng 1)">
            <i data-lucide="arrow-up-circle" class="w-4 h-4"></i>
          </button>` : ''}
          <!-- Edit Button -->
          <button type="button" class="btn-edit-candidate p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/10 text-xs transition-all" title="Chỉnh sửa tên và nghề nghiệp">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <!-- Set Rigged Winner Button -->
          <button type="button" class="btn-set-rigged p-2 rounded-lg ${isRigged ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 hover:text-amber-300 hover:bg-white/10'} text-xs font-bold transition-all" title="Chỉ định chắc chắn thắng">
            <i data-lucide="crown" class="w-4 h-4"></i>
          </button>
          <!-- Delete Button -->
          <button type="button" class="btn-delete-candidate p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 text-xs transition-all" title="Xóa">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;

      // Move to top Event
      const btnMoveTop = row.querySelector('.btn-move-top');
      if (btnMoveTop) {
        btnMoveTop.onclick = () => {
          this.mode2Config.roster.splice(index, 1);
          this.mode2Config.roster.unshift(candidate);
          this.saveStudioProgress();
          this.renderStudioMode2();
          this.showToast(`⚡ Đã đưa [${candidate.name}] lên vị trí #1!`);
          setTimeout(() => {
            const el = document.querySelector(`[data-candidate-id="${candidate.id}"]`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('ring-2', 'ring-amber-400', 'bg-amber-400/30');
              setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400', 'bg-amber-400/30'), 2000);
            }
          }, 80);
        };
      }

      // Edit Event
      const btnEdit = row.querySelector('.btn-edit-candidate');
      btnEdit.onclick = () => this.openCandidateModal(index);

      // Set Rigged Winner
      const btnSetRigged = row.querySelector('.btn-set-rigged');
      btnSetRigged.onclick = () => {
        if (this.mode2Config.riggedWinnerId === candidate.id) {
          this.mode2Config.riggedWinnerId = "";
          this.showToast('Đã hủy chỉ định người thắng!');
        } else {
          this.mode2Config.riggedWinnerId = candidate.id;
          this.showToast(`👑 Đã cài đặt [${candidate.name}] thắng tuyệt đối!`);
        }
        this.saveStudioProgress();
        this.renderStudioMode2();
      };

      // Delete Candidate
      const btnDelete = row.querySelector('.btn-delete-candidate');
      btnDelete.onclick = () => {
        if (this.mode2Config.roster.length <= 2) {
          alert('Cần tối thiểu ít nhất 2 nhân vật để tạo giải đấu!');
          return;
        }
        this.mode2Config.roster.splice(index, 1);
        if (this.mode2Config.riggedWinnerId === candidate.id) {
          this.mode2Config.riggedWinnerId = "";
        }
        this.saveStudioProgress();
        this.renderStudioMode2();
        this.showToast(`Đã xóa [${candidate.name}]`);
      };

      listContainer.appendChild(row);
    });

    lucide.createIcons();
  }

  _resizeImageElement(img, maxDimension, quality, outputMime = '') {
    let targetW = img.naturalWidth || img.width || maxDimension;
    let targetH = img.naturalHeight || img.height || maxDimension;

    if (targetW > maxDimension || targetH > maxDimension) {
      if (targetW > targetH) {
        targetH = Math.max(1, Math.round((targetH * maxDimension) / targetW));
        targetW = maxDimension;
      } else {
        targetW = Math.max(1, Math.round((targetW * maxDimension) / targetH));
        targetH = maxDimension;
      }
    }

    // Multi-step progressive 2x downsampling prevents canvas aliasing/blurriness on large photos
    let curCanvas = document.createElement('canvas');
    let curW = img.naturalWidth || img.width || targetW;
    let curH = img.naturalHeight || img.height || targetH;
    curCanvas.width = curW;
    curCanvas.height = curH;
    let curCtx = curCanvas.getContext('2d');
    curCtx.imageSmoothingEnabled = true;
    curCtx.imageSmoothingQuality = 'high';
    curCtx.drawImage(img, 0, 0, curW, curH);

    while (curW * 0.5 > targetW && curH * 0.5 > targetH) {
      const nextW = Math.max(targetW, Math.round(curW * 0.5));
      const nextH = Math.max(targetH, Math.round(curH * 0.5));
      const stepCanvas = document.createElement('canvas');
      stepCanvas.width = nextW;
      stepCanvas.height = nextH;
      const stepCtx = stepCanvas.getContext('2d');
      stepCtx.imageSmoothingEnabled = true;
      stepCtx.imageSmoothingQuality = 'high';
      stepCtx.drawImage(curCanvas, 0, 0, curW, curH, 0, 0, nextW, nextH);
      curCanvas = stepCanvas;
      curW = nextW;
      curH = nextH;
    }

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = Math.max(1, targetW);
    finalCanvas.height = Math.max(1, targetH);
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';

    if (outputMime === 'image/jpeg') {
      finalCtx.fillStyle = '#ffffff';
      finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    }

    finalCtx.drawImage(curCanvas, 0, 0, curW, curH, 0, 0, finalCanvas.width, finalCanvas.height);

    if (outputMime) {
      return finalCanvas.toDataURL(outputMime, quality);
    }
    try {
      const webp = finalCanvas.toDataURL('image/webp', quality);
      if (webp && webp.startsWith('data:image/webp')) {
        return webp;
      }
    } catch (err) {}
    return finalCanvas.toDataURL('image/jpeg', quality);
  }

  compressImageToDataUrl(file, maxDimension = 1440, quality = 0.94) {
    return new Promise((resolve) => {
      if (!file || !file.type || !file.type.startsWith('image/')) {
        resolve('');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target.result;
        const nativeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        // Preserve exact untouched original pixels ("nét như ảnh gốc") for files <= 550KB
        if (file.size <= 550 * 1024 && nativeTypes.includes(file.type)) {
          resolve(rawDataUrl);
          return;
        }

        const img = new Image();
        img.onload = () => {
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          if (w <= maxDimension && h <= maxDimension && file.size <= 1.0 * 1024 * 1024 && nativeTypes.includes(file.type)) {
            resolve(rawDataUrl);
            return;
          }
          const preferMime = file.type === 'image/png' ? 'image/webp' : '';
          resolve(this._resizeImageElement(img, maxDimension, quality, preferMime));
        };
        img.onerror = () => resolve(rawDataUrl);
        img.src = rawDataUrl;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  compressBase64Image(base64Str, maxDimension = 1440, quality = 0.94) {
    return new Promise((resolve) => {
      if (!base64Str || !base64Str.startsWith('data:image/')) {
        resolve(base64Str);
        return;
      }
      const img = new Image();
      img.onload = () => {
        resolve(this._resizeImageElement(img, maxDimension, quality));
      };
      img.onerror = () => resolve('');
      img.src = base64Str;
    });
  }

  async sanitizeRosterImages(targetRoster) {
    if (!Array.isArray(targetRoster)) return;
    const localImgCands = targetRoster.filter(c => c.avatar && c.avatar.startsWith('data:image/'));
    if (localImgCands.length === 0) return;

    // Budget keeps serialized share URL safely under spoo.me direct-redirect limit (~15k chars)
    const perCandBudget = Math.min(8500, Math.floor(9200 / localImgCands.length));
    const presets = [
      [360, 0.82],
      [240, 0.74],
      [160, 0.65],
      [100, 0.55]
    ];

    for (const cand of localImgCands) {
      if (cand.avatar.length <= perCandBudget) continue;
      let fitted = '';
      try {
        for (const [dim, qual] of presets) {
          const attempt = await this.compressBase64Image(cand.avatar, dim, qual);
          if (attempt && attempt.length <= perCandBudget) {
            fitted = attempt;
            break;
          }
        }
      } catch (e) {
        fitted = '';
      }
      cand.avatar = fitted;
    }
  }

  openCandidateModal(editIndex = null) {
    const modal = document.getElementById('modal-add-candidate');
    const modalTitle = document.getElementById('modal-cand-title');
    const nameInp = document.getElementById('modal-cand-name');
    const fieldInp = document.getElementById('modal-cand-field');
    const avatarInp = document.getElementById('modal-cand-avatar');
    const avatarFileInp = document.getElementById('modal-cand-file');
    const avatarPreviewImg = document.getElementById('modal-avatar-preview-img');
    const avatarPreviewInitials = document.getElementById('modal-avatar-preview-initials');
    const btnSave = document.getElementById('btn-save-candidate');
    const btnCancel = document.getElementById('btn-cancel-candidate');

    const isEdit = editIndex !== null;
    const existing = isEdit ? this.mode2Config.roster[editIndex] : null;

    modalTitle.textContent = isEdit ? 'Chỉnh Sửa Thông Tin Nhân Vật' : 'Thêm Nhân Vật Mới';
    nameInp.value = existing ? existing.name : '';
    fieldInp.value = existing ? existing.field : '';
    avatarInp.value = existing ? existing.avatar : '';
    avatarFileInp.value = '';

    const topToggleInp = document.getElementById('modal-cand-top-toggle');
    const riggedToggleInp = document.getElementById('modal-cand-rigged-toggle');

    if (topToggleInp) {
      topToggleInp.checked = isEdit ? (editIndex === 0) : true;
    }
    if (riggedToggleInp) {
      riggedToggleInp.checked = existing ? (this.mode2Config.riggedWinnerId === existing.id) : false;
    }

    const updatePreview = () => {
      const rawUrl = avatarInp.value.trim();
      const resolved = resolveAvatarUrl(rawUrl);
      if (resolved) {
        avatarPreviewImg.onload = () => {
          if (rawUrl.startsWith('data:image/') && avatarPreviewImg.naturalWidth > 0 && avatarPreviewImg.naturalWidth < 120) {
            this.showToast('⚠️ Ảnh đang lưu bị mờ từ bản cũ — hãy tải lại ảnh từ máy để nét gốc!');
          }
        };
        avatarPreviewImg.style.display = '';
        avatarPreviewImg.src = resolved;
        avatarPreviewImg.classList.remove('hidden');
        avatarPreviewInitials.classList.add('hidden');
      } else {
        avatarPreviewImg.onload = null;
        avatarPreviewImg.classList.add('hidden');
        avatarPreviewInitials.classList.remove('hidden');
        const nameVal = nameInp.value.trim() || 'VIP';
        avatarPreviewInitials.textContent = nameVal.substring(0, 2).toUpperCase();
      }
    };

    updatePreview();

    avatarInp.oninput = () => updatePreview();
    nameInp.oninput = () => {
      if (!avatarInp.value.trim()) updatePreview();
    };

    avatarFileInp.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        this.showToast('⏳ Đang xử lý ảnh giữ nguyên độ nét gốc...');
        try {
          const processed = await this.compressImageToDataUrl(file, 1440, 0.94);
          if (processed) {
            avatarInp.value = processed;
            updatePreview();
            this.showToast('✨ Đã tải ảnh đại diện sắc nét chuẩn ảnh gốc!');
          } else {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
              avatarInp.value = loadEvent.target.result;
              updatePreview();
            };
            reader.readAsDataURL(file);
          }
        } catch (err) {
          console.warn('Image upload error', err);
        }
      }
    };

    btnCancel.onclick = () => modal.classList.add('hidden');

    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    };

    btnSave.onclick = () => {
      const name = nameInp.value.trim();
      const field = fieldInp.value.trim() || 'Thần tượng nổi tiếng';
      const rawAvatar = avatarInp.value.trim();
      const resolvedAvatar = resolveAvatarUrl(rawAvatar);
      const moveToTop = topToggleInp ? topToggleInp.checked : true;
      const makeRigged = riggedToggleInp ? riggedToggleInp.checked : false;

      if (!name) {
        alert('Vui lòng nhập tên nhân vật!');
        return;
      }

      const initials = computeInitials(name);
      let targetId = '';

      if (isEdit) {
        const item = this.mode2Config.roster[editIndex];
        item.name = name;
        item.field = field;
        item.avatar = resolvedAvatar;
        item.initials = initials;
        targetId = item.id;
        if (makeRigged) {
          this.mode2Config.riggedWinnerId = item.id;
        } else if (this.mode2Config.riggedWinnerId === item.id) {
          this.mode2Config.riggedWinnerId = "";
        }
        if (moveToTop && editIndex > 0) {
          this.mode2Config.roster.splice(editIndex, 1);
          this.mode2Config.roster.unshift(item);
        }
        this.showToast(`Đã cập nhật: ${name}`);
      } else {
        const newCandidate = {
          id: `celeb-${Date.now()}`,
          name: name,
          field: field,
          avatar: resolvedAvatar,
          initials: initials,
          color: 'from-amber-400 to-rose-600'
        };
        targetId = newCandidate.id;
        if (moveToTop) {
          this.mode2Config.roster.unshift(newCandidate);
        } else {
          this.mode2Config.roster.push(newCandidate);
        }
        if (makeRigged) {
          this.mode2Config.riggedWinnerId = newCandidate.id;
        }
        this.showToast(`🎉 Đã thêm thành công: ${name}`);
      }

      modal.classList.add('hidden');
      try {
        this.saveStudioProgress();
      } catch (err) {
        console.warn('saveStudioProgress error:', err);
      }
      this.renderStudioMode2();

      // Auto-scroll and glow highlight target row so user sees it instantly
      setTimeout(() => {
        const targetRow = document.querySelector(`[data-candidate-id="${targetId}"]`);
        if (targetRow) {
          targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetRow.classList.add('ring-2', 'ring-amber-400', 'bg-amber-400/30', 'scale-[1.02]');
          setTimeout(() => {
            targetRow.classList.remove('ring-2', 'ring-amber-400', 'bg-amber-400/30', 'scale-[1.02]');
          }, 2500);
        }
      }, 80);
    };

    modal.classList.remove('hidden');
  }

  addCreatorAsFinalBoss() {
    const creatorName = prompt('Nhập tên của bạn (người tạo thử thách):', 'Tôi (Trùm cuối)');
    if (!creatorName) return;

    const creatorField = prompt('Nhập danh hiệu / nghề nghiệp của bạn:', 'Nhân vật quyền lực nhất');
    const avatarUrl = prompt('Nhập link ảnh hoặc link YouTube/TikTok của bạn (hoặc để trống):', '');

    const id = `celeb-creator-${Date.now()}`;
    const initials = computeInitials(creatorName);

    const creatorCandidate = {
      id: id,
      name: creatorName,
      field: creatorField || 'Thần Tượng Bất Tử',
      avatar: resolveAvatarUrl(avatarUrl),
      initials: initials,
      color: 'from-amber-400 via-yellow-300 to-red-600'
    };

    this.mode2Config.roster.push(creatorCandidate);
    this.mode2Config.riggedWinnerId = id;
    this.mode2Config.riggedFinalBoss = true;

    this.saveStudioProgress();
    this.renderStudioMode2();
    this.showToast(`🔥 Đã cài đặt [${creatorName}] làm Trùm Cuối và chắc chắn thắng!`);

    setTimeout(() => {
      const targetRow = document.querySelector(`[data-candidate-id="${id}"]`);
      if (targetRow) {
        targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetRow.classList.add('ring-2', 'ring-amber-400', 'bg-amber-400/30', 'scale-[1.02]');
        setTimeout(() => {
          targetRow.classList.remove('ring-2', 'ring-amber-400', 'bg-amber-400/30', 'scale-[1.02]');
        }, 2500);
      }
    }, 80);
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

    for (let i = 0; i < 16; i++) {
      const p = document.createElement('div');
      p.className = 'floating-particle';
      const icon = icons[i % icons.length];
      p.textContent = icon;

      const leftPercent = Math.random() * 92 + 4;
      const duration = Math.random() * 7 + 8;
      const delay = Math.random() * 8;
      const size = Math.random() * 16 + 18;

      p.style.left = `${leftPercent}%`;
      p.style.animationDuration = `${duration}s`;
      p.style.animationDelay = `-${delay}s`;
      p.style.fontSize = `${size}px`;

      container.appendChild(p);
    }
  }

  /* ========================================================
   * PLAYER VIEW LAUNCHER
   * ======================================================== */
  previewAsPlayer(mode) {
    this.readCurrentStudioInputs(mode);
    this.currentMode = mode;
    this.launchPlayerView(true);
  }

  launchPlayerView(forceFresh = false) {
    evasionEngine.detach();
    this.currentView = 'player';

    const studioContainer = document.getElementById('creator-studio-container');
    const playerContainer = document.getElementById('player-experience-container');
    const studioTabs = document.getElementById('studio-mode-tabs');

    studioContainer.classList.add('hidden');
    playerContainer.classList.remove('hidden');
    if (studioTabs) studioTabs.classList.add('hidden');

    const activeMusic = this.currentMode === 'mode2' ? this.mode2Config.musicUrl : this.mode1Config.musicUrl;
    sounds.playMusic(activeMusic);

    if (this.currentMode === 'mode1') {
      if (forceFresh) this.removeFromStorage(this.getMode1GameStorageKey());
      this.startMode1PlayerGame(forceFresh);
    } else {
      if (forceFresh) this.clearMode2GameProgress();
      this.startMode2KnockoutGame(forceFresh);
    }

    lucide.createIcons();
  }

  /* ========================================================
   * MODE 1: BẪY TÌNH YÊU PLAY ENGINE
   * ======================================================== */
  startMode1PlayerGame(forceNew = false) {
    evasionEngine.detach();
    const playerContainer = document.getElementById('player-experience-container');
    const theme = THEMES[this.mode1Config.theme] || THEMES.love;

    this.renderBackgroundDecorations(this.mode1Config.theme);

    const m1PlayKey = this.getMode1GameStorageKey();
    if (!forceNew) {
      const savedM1 = this.loadFromStorage(m1PlayKey);
      if (savedM1 && savedM1.completed) {
        this.celebrateMode1();
        this.showToast('⚡ Đã mở lại màn hình chúc mừng trước đó');
        return;
      }
    }

    playerContainer.className = `min-h-[82vh] flex items-center justify-center p-4 transition-colors duration-500 bg-gradient-to-br ${theme.bgGradient} relative z-10`;

    playerContainer.innerHTML = `
      <div id="m1-game-box" class="w-full max-w-xl mx-auto rounded-3xl p-8 md:p-12 text-center border ${theme.cardBorder} ${theme.cardBg} shadow-2xl relative overflow-visible min-h-[380px] md:min-h-[420px] flex flex-col justify-between">
        
        <div>
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.badgeColor} border text-xs font-bold uppercase tracking-wider mb-5">
            <i data-lucide="${theme.icon}" class="w-3.5 h-3.5"></i>
            <span>${theme.name}</span>
          </div>

          <h1 id="m1-display-question" class="text-2xl md:text-4xl font-black text-white mb-3 leading-tight select-none">
            ${this.escapeHtml(this.mode1Config.question)}
          </h1>

          ${this.mode1Config.subtitle ? `<p class="text-sm md:text-base text-slate-300 mb-8 max-w-md mx-auto select-none">${this.escapeHtml(this.mode1Config.subtitle)}</p>` : '<div class="mb-6"></div>'}
        </div>

        <!-- Buttons Arena: Runaway button jumps strictly inside this game card! -->
        <div id="m1-buttons-arena" class="relative min-h-[140px] flex items-center justify-center gap-6 md:gap-8 my-auto">
          
          <button id="m1-target-btn" type="button" class="relative z-10 px-8 py-4 rounded-2xl font-black text-lg md:text-xl transition-all transform hover:scale-105 active:scale-95 shadow-xl ${theme.targetBtnClass}">
            ${this.escapeHtml(this.mode1Config.targetText)}
          </button>

          <button id="m1-reject-btn" type="button" class="px-7 py-3.5 rounded-2xl font-bold text-base md:text-lg transition-all ${theme.rejectBtnClass} backdrop-blur-md">
            ${this.escapeHtml(this.mode1Config.rejectText)}
          </button>
        </div>

        <div class="text-xs text-slate-400 flex items-center justify-center gap-1.5 select-none pt-4">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-pink-400"></i>
          <span>Hãy chọn câu trả lời thật lòng từ trái tim nhé!</span>
        </div>
      </div>
    `;

    lucide.createIcons();

    const rejectBtn = document.getElementById('m1-reject-btn');
    const targetBtn = document.getElementById('m1-target-btn');

    evasionEngine.attach(rejectBtn, {
      proximityRadius: window.innerWidth < 768 ? 60 : 80,
      quips: DEFAULT_RUNAWAY_QUIPS
    });

    targetBtn.onclick = () => {
      evasionEngine.detach();
      this.celebrateMode1();
    };
  }

  celebrateMode1() {
    sounds.playSuccess();
    this.triggerConfetti();

    this.saveToStorage(this.getMode1GameStorageKey(), { completed: true, timestamp: Date.now() });

    const gameBox = document.getElementById('m1-game-box');
    const theme = THEMES[this.mode1Config.theme] || THEMES.love;

    gameBox.innerHTML = `
      <div class="space-y-6 animate-pop-in my-auto">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.badgeColor} border text-xs font-bold uppercase tracking-wider">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
          <span>Lựa Chọn Tuyệt Vời Nhất!</span>
        </div>

        <h2 class="text-2xl md:text-4xl font-black text-white leading-tight">
          ${this.escapeHtml(this.mode1Config.celebrationTitle)}
        </h2>

        <div class="w-full max-w-sm mx-auto h-64 rounded-2xl overflow-hidden border-2 ${theme.cardBorder} shadow-2xl relative bg-slate-950">
          <img src="${this.mode1Config.celebrationGif}" alt="Celebration GIF" class="w-full h-full object-cover" onerror="this.src='https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif'" />
        </div>

        <p class="text-base md:text-lg text-slate-200 leading-relaxed max-w-md mx-auto">
          ${this.escapeHtml(this.mode1Config.celebrationMessage)}
        </p>

        <div class="pt-4 flex items-center justify-center gap-4">
          <button id="m1-replay-btn" type="button" class="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2">
            <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
            <span>Chơi lại</span>
          </button>
          <button id="m1-share-btn" type="button" class="px-6 py-3 rounded-xl ${theme.targetBtnClass} font-bold text-sm transition-all flex items-center gap-2">
            <i data-lucide="share-2" class="w-4 h-4"></i>
            <span>Chia sẻ câu này</span>
          </button>
        </div>
      </div>
    `;

    lucide.createIcons();

    document.getElementById('m1-replay-btn').onclick = () => {
      this.removeFromStorage(this.getMode1GameStorageKey());
      this.startMode1PlayerGame(true);
    };

    document.getElementById('m1-share-btn').onclick = () => {
      this.generateAndCopyShareLink('mode1');
    };
  }

  /* ========================================================
   * MODE 2: ĐẠI CHIẾN NGÔI SAO PLAY ENGINE
   * ======================================================== */
  startMode2KnockoutGame(forceNew = false) {
    evasionEngine.detach();
    const roster = JSON.parse(JSON.stringify(this.mode2Config.roster));

    if (roster.length < 2) {
      alert('Danh sách cần tối thiểu 2 người!');
      this.switchStudioMode('mode2');
      return;
    }

    this.renderBackgroundDecorations('luxury');

    const storageKey = this.getMode2GameStorageKey();
    if (!forceNew) {
      const saved = this.loadFromStorage(storageKey);
      if (saved && !saved.isFinished && saved.candidate1 && saved.candidate2 && saved.roundNumber > 1) {
        this.mode2Game = saved;
        this.renderMode2Duel();
        this.showToast(`⚡ Đã khôi phục tiến trình: Vòng ${saved.roundNumber} / ${saved.totalRounds}`);
        return;
      }
    }

    this.clearMode2GameProgress();

    const riggedId = this.mode2Config.riggedWinnerId;
    const finalBossMode = this.mode2Config.riggedFinalBoss;

    let finalBoss = null;
    let pool = [...roster];

    if (riggedId && finalBossMode) {
      const bossIdx = pool.findIndex(c => c.id === riggedId);
      if (bossIdx !== -1) {
        finalBoss = pool.splice(bossIdx, 1)[0];
      }
    }

    const candidate1 = pool.shift();
    const candidate2 = pool.shift();

    if (finalBoss) {
      pool.push(finalBoss);
    }

    this.mode2Game = {
      queue: pool,
      candidate1: candidate1,
      candidate2: candidate2,
      roundNumber: 1,
      totalRounds: roster.length - 1,
      isFinished: false,
      winner: null
    };

    this.saveMode2GameProgress();
    this.renderMode2Duel();
  }

  renderMode2Duel() {
    evasionEngine.detach();
    const playerContainer = document.getElementById('player-experience-container');
    playerContainer.className = 'min-h-[82vh] p-4 flex items-center justify-center bg-gradient-to-br from-slate-950 via-zinc-950 to-neutral-950 relative z-10';

    const { candidate1, candidate2, roundNumber, totalRounds } = this.mode2Game;
    const isFinalRound = this.mode2Game.queue.length === 0;

    const riggedId = this.mode2Config.riggedWinnerId;
    const isCand1Rigged = riggedId && candidate1.id === riggedId;
    const isCand2Rigged = riggedId && candidate2.id === riggedId;
    const isRiggedMatch = isCand1Rigged || isCand2Rigged;

    playerContainer.innerHTML = `
      <div class="w-full max-w-4xl mx-auto space-y-6">
        
        <!-- Header & Progress -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider">
            <i data-lucide="flame" class="w-3.5 h-3.5 text-amber-400"></i>
            <span>${isFinalRound ? 'TRẬN CHUNG KẾT ĐỈNH CAO' : `LƯỢT ĐỐI ĐẦU ${roundNumber} / ${totalRounds}`}</span>
          </div>

          <h1 class="text-2xl md:text-4xl font-black text-white">
            ${this.escapeHtml(this.mode2Config.title)}
          </h1>
          <p class="text-xs md:text-sm text-slate-400">
            ${this.escapeHtml(this.mode2Config.subtitle)}
          </p>

          <div class="w-full max-w-md mx-auto bg-slate-900 rounded-full h-2.5 overflow-hidden border border-white/10 mt-3">
            <div class="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-500" style="width: ${(roundNumber / totalRounds) * 100}%"></div>
          </div>

          <div class="flex items-center justify-center gap-3 text-xs text-slate-400 mt-2">
            <span class="inline-flex items-center gap-1 text-emerald-400 font-semibold"><i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Đã tự động lưu lượt đấu</span>
            ${roundNumber > 1 ? `<span>•</span><button id="btn-restart-duel" type="button" class="text-slate-400 hover:text-amber-300 underline font-medium cursor-pointer">Chơi lại từ Vòng 1</button>` : ''}
          </div>
        </div>

        <!-- Symmetrical Prestigious Duel Cards -->
        <div id="m2-arena" class="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center justify-center pt-2">
          
          <!-- LEFT CARD -->
          <div id="card-cand-1" class="carpet-card glass-panel-gold rounded-3xl p-6 text-center border border-amber-400/40 cursor-pointer select-none group relative ${isCand1Rigged ? 'rigged-favored-champion' : (isCand2Rigged ? 'rigged-rival-shrunk' : '')}">
            ${isCand1Rigged ? '<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs shadow-lg uppercase tracking-wide mb-1">👑 Ứng Viên Bảo Chứng</div>' : ''}
            
            <div class="w-32 h-32 md:w-44 md:h-44 mx-auto rounded-2xl overflow-hidden my-4 border-2 border-amber-400/60 shadow-2xl relative bg-slate-900 ring-2 ring-amber-400/20">
              ${this.renderCardImage(candidate1)}
            </div>

            <h3 class="text-xl md:text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
              ${this.escapeHtml(candidate1.name)}
            </h3>
            <p class="text-xs md:text-sm text-slate-300 mt-1 mb-5">
              ${this.escapeHtml(candidate1.field)}
            </p>

            <button type="button" class="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 group-hover:shadow-amber-400/60 transition-all flex items-center justify-center gap-2">
              <i data-lucide="crown" class="w-4 h-4"></i>
              <span>BÌNH CHỌN ${this.escapeHtml(candidate1.name)}</span>
            </button>
          </div>

          <!-- Center VS Badge -->
          <div class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div class="w-16 h-16 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center vs-badge shadow-2xl">
              <span class="text-xl font-black italic gold-text">VS</span>
            </div>
          </div>

          <!-- RIGHT CARD -->
          <div id="card-cand-2" class="carpet-card glass-panel-gold rounded-3xl p-6 text-center border border-amber-400/40 cursor-pointer select-none group relative ${isCand2Rigged ? 'rigged-favored-champion' : (isCand1Rigged ? 'rigged-rival-shrunk' : '')}">
            ${isCand2Rigged ? '<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs shadow-lg uppercase tracking-wide mb-1">👑 Ứng Viên Bảo Chứng</div>' : ''}
            
            <div class="w-32 h-32 md:w-44 md:h-44 mx-auto rounded-2xl overflow-hidden my-4 border-2 border-amber-400/60 shadow-2xl relative bg-slate-900 ring-2 ring-amber-400/20">
              ${this.renderCardImage(candidate2)}
            </div>

            <h3 class="text-xl md:text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
              ${this.escapeHtml(candidate2.name)}
            </h3>
            <p class="text-xs md:text-sm text-slate-300 mt-1 mb-5">
              ${this.escapeHtml(candidate2.field)}
            </p>

            <button type="button" class="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 group-hover:shadow-amber-400/60 transition-all flex items-center justify-center gap-2">
              <i data-lucide="crown" class="w-4 h-4"></i>
              <span>BÌNH CHỌN ${this.escapeHtml(candidate2.name)}</span>
            </button>
          </div>

        </div>

        <div class="text-center text-xs text-slate-400 pt-2">
          Còn lại <strong>${this.mode2Game.queue.length}</strong> gương mặt đang chờ so tài
        </div>
      </div>
    `;

    lucide.createIcons();

    const btnRestartDuel = document.getElementById('btn-restart-duel');
    if (btnRestartDuel) {
      btnRestartDuel.onclick = () => {
        if (confirm('Bạn có muốn chơi lại giải đấu từ Vòng 1 không?')) {
          this.startMode2KnockoutGame(true);
        }
      };
    }

    const card1 = document.getElementById('card-cand-1');
    const card2 = document.getElementById('card-cand-2');

    // Rigged Evasion Mechanic
    if (isRiggedMatch) {
      const favoredCand = isCand1Rigged ? candidate1 : candidate2;
      const favoredCard = isCand1Rigged ? card1 : card2;
      const rivalCand = isCand1Rigged ? candidate2 : candidate1;
      const rivalCard = isCand1Rigged ? card2 : card1;

      // 1. Mark Favored Champion Card (keeps full size, dignified aura)
      favoredCard.classList.add('rigged-favored-champion');

      // 2. Mark Rival Card (shrunk, non-clickable for victory)
      rivalCard.classList.add('rigged-rival-shrunk');
      const rivalBtn = rivalCard.querySelector('button');
      if (rivalBtn) {
        rivalBtn.classList.remove('bg-gradient-to-r', 'from-amber-400', 'via-yellow-400', 'to-amber-500', 'text-slate-950', 'group-hover:shadow-amber-400/60');
        rivalBtn.classList.add('bg-slate-800', 'text-slate-400', 'border', 'border-white/10');
        rivalBtn.innerHTML = `<span class="truncate">Không thể chọn 😜</span>`;
      }

      // Attach evasion with shrunk mode and avoidElement so it NEVER lands on or covers favoredCard
      evasionEngine.attach(rivalCard, {
        shrunk: true,
        avoidElement: favoredCard,
        proximityRadius: window.innerWidth < 768 ? 70 : 95,
        quips: [
          `Ủa tính chọn đối thủ hả? ${favoredCand.name} mới là Số 1! 👑`,
          "Không có cửa bấm vào đây đâu nha! 😜",
          "Thần tượng chiến thắng đã định đoạt rồi! 👉",
          "Bấm người bên kia kìa haha! 🏃‍♂️💨"
        ]
      });

      // Clicking rival card NEVER selects winner, only dodges
      rivalCard.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        evasionEngine.dodge(e);
      };

      // Only favored card can be clicked to win
      favoredCard.onclick = () => {
        evasionEngine.detach();
        sounds.playSelect();
        this.selectCandidateWinner(favoredCand);
      };
    } else {
      card1.onclick = () => {
        sounds.playSelect();
        this.selectCandidateWinner(candidate1);
      };

      card2.onclick = () => {
        sounds.playSelect();
        this.selectCandidateWinner(candidate2);
      };
    }
  }

  selectCandidateWinner(winnerCand) {
    const { queue } = this.mode2Game;

    if (queue.length > 0) {
      this.mode2Game.candidate1 = winnerCand;
      this.mode2Game.candidate2 = queue.shift();
      this.mode2Game.roundNumber++;
      this.saveMode2GameProgress();
      this.renderMode2Duel();
    } else {
      this.mode2Game.isFinished = true;
      this.mode2Game.winner = winnerCand;
      this.clearMode2GameProgress();
      this.crownChampion();
    }
  }

  crownChampion() {
    evasionEngine.detach();
    sounds.playFanfare();
    this.triggerConfetti();

    const playerContainer = document.getElementById('player-experience-container');
    const winner = this.mode2Game.winner;

    playerContainer.innerHTML = `
      <div class="w-full max-w-2xl mx-auto glass-panel-gold rounded-3xl p-8 md:p-12 text-center border border-amber-400 shadow-2xl relative overflow-hidden animate-pop-in my-auto">
        
        <div class="text-6xl trophy-glow my-3">👑</div>

        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-4">
          <i data-lucide="crown" class="w-4 h-4 text-amber-400"></i>
          <span>THẦN TƯỢNG QUÁN QUÂN SỐ 1</span>
        </div>

        <div class="w-40 h-40 md:w-52 md:h-52 mx-auto rounded-3xl overflow-hidden border-4 border-amber-400 shadow-2xl relative my-6 bg-slate-900 ring-8 ring-amber-400/20">
          ${this.renderCardImage(winner)}
        </div>

        <h2 class="text-3xl md:text-5xl font-black gold-text mb-2">
          ${this.escapeHtml(winner.name)}
        </h2>
        <p class="text-base text-slate-300 font-medium mb-8">
          ${this.escapeHtml(winner.field)}
        </p>

        <div class="flex flex-wrap items-center justify-center gap-4">
          <button id="m2-restart-btn" type="button" class="px-8 py-4 rounded-2xl font-black text-base bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-xl shadow-amber-500/40 hover:shadow-amber-400/70 transition-all flex items-center gap-2">
            <i data-lucide="rotate-ccw" class="w-5 h-5"></i>
            <span>CHƠI LẠI TỪ ĐẦU</span>
          </button>
          
          <button id="m2-share-btn" type="button" class="px-7 py-4 rounded-2xl font-bold text-base bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2">
            <i data-lucide="share-2" class="w-5 h-5"></i>
            <span>Chia sẻ kết quả này</span>
          </button>
        </div>

      </div>
    `;

    lucide.createIcons();

    document.getElementById('m2-restart-btn').onclick = () => {
      this.clearMode2GameProgress();
      this.startMode2KnockoutGame(true);
    };

    document.getElementById('m2-share-btn').onclick = () => {
      this.generateAndCopyShareLink('mode2');
    };
  }

  renderCardImage(candidate) {
    const initials = candidate.initials || candidate.name.substring(0, 2).toUpperCase();
    const resolvedAvatar = resolveAvatarUrl(candidate.avatar);
    if (resolvedAvatar) {
      return `
        <div class="w-full h-full relative">
          <img src="${resolvedAvatar}" referrerpolicy="no-referrer" alt="${this.escapeHtml(candidate.name)}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');" />
          <div class="hidden w-full h-full flex flex-col items-center justify-center font-black text-3xl md:text-5xl bg-gradient-to-br from-amber-500 to-red-600 text-white">
            ${initials}
          </div>
        </div>
      `;
    }
    return `
      <div class="w-full h-full flex flex-col items-center justify-center font-black text-3xl md:text-5xl bg-gradient-to-br ${candidate.color || 'from-amber-500 to-red-600'} text-white">
        ${initials}
      </div>
    `;
  }

  /* ========================================================
   * READ DOM INPUTS BEFORE SHARING / PLAYING
   * ======================================================== */
  readCurrentStudioInputs(mode = 'mode1') {
    if (mode === 'mode1') {
      const q = document.getElementById('m1-question');
      const s = document.getElementById('m1-subtitle');
      const yt = document.getElementById('m1-target-text');
      const rt = document.getElementById('m1-reject-text');
      const ct = document.getElementById('m1-celeb-title');
      const cm = document.getElementById('m1-celeb-msg');
      const cg = document.getElementById('m1-custom-gif');
      const mu = document.getElementById('m1-music-url');

      if (q && q.value.trim()) this.mode1Config.question = q.value.trim();
      if (s) this.mode1Config.subtitle = s.value.trim();
      if (yt && yt.value.trim()) this.mode1Config.targetText = yt.value.trim();
      if (rt && rt.value.trim()) this.mode1Config.rejectText = rt.value.trim();
      if (ct && ct.value.trim()) this.mode1Config.celebrationTitle = ct.value.trim();
      if (cm && cm.value.trim()) this.mode1Config.celebrationMessage = cm.value.trim();
      if (cg && cg.value.trim()) this.mode1Config.celebrationGif = cg.value.trim();
      if (mu) {
        const curMu = this.mode1Config.musicUrl || '';
        if (!curMu.startsWith('data:audio')) {
          this.mode1Config.musicUrl = mu.value.trim();
        }
      }
    } else {
      const t = document.getElementById('m2-title');
      const s = document.getElementById('m2-subtitle');
      const mu = document.getElementById('m2-music-url');
      const rw = document.getElementById('m2-rigged-winner');
      const fb = document.getElementById('m2-final-boss-toggle');

      if (t && t.value.trim()) this.mode2Config.title = t.value.trim();
      if (s) this.mode2Config.subtitle = s.value.trim();
      if (mu) {
        const curMu = this.mode2Config.musicUrl || '';
        if (!curMu.startsWith('data:audio')) {
          this.mode2Config.musicUrl = mu.value.trim();
        }
      }
      if (rw && document.activeElement === rw) this.mode2Config.riggedWinnerId = rw.value;
      if (fb) this.mode2Config.riggedFinalBoss = fb.checked;
    }
  }

  /* ========================================================
   * URL SHORTENING & JSONP NETWORK HELPERS
   * ======================================================== */
  jsonpRequest(url, paramName = 'callback', timeoutMs = 3500) {
    return new Promise((resolve, reject) => {
      const cbName = 'jsonp_cb_' + Math.random().toString(36).slice(2) + '_' + Date.now();
      const script = document.createElement('script');
      let timer = null;

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };

      window[cbName] = (data) => {
        cleanup();
        resolve(data);
      };

      script.onerror = () => {
        cleanup();
        reject(new Error('JSONP load error'));
      };

      timer = setTimeout(() => {
        cleanup();
        reject(new Error('JSONP request timed out'));
      }, timeoutMs);

      const sep = url.includes('?') ? '&' : '?';
      script.src = `${url}${sep}${paramName}=${cbName}`;
      document.head.appendChild(script);
    });
  }

  copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(() => {
        return this.fallbackCopyText(text);
      });
    } else {
      return Promise.resolve(this.fallbackCopyText(text));
    }
  }

  fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    let success = false;
    try {
      success = document.execCommand('copy');
    } catch (err) {
      console.warn('Fallback copy failed', err);
    }
    if (textArea.parentNode) {
      textArea.parentNode.removeChild(textArea);
    }
    return success;
  }

  async saveCloudConfig(type, config) {
    const packed = buildPackedConfig(type, config, Infinity);
    const jsonBody = JSON.stringify(packed);

    // 1. Primary: pastes.dev (CORS supported, 1MB+ JSON, preserves 100% original sharp photos)
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch('https://api.pastes.dev/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonBody,
        signal: controller.signal
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (data && data.key) {
          return `d:${data.key}`;
        }
      }
    } catch (e) {
      console.warn('pastes.dev save error:', e);
    }

    // 2. Secondary: paste.gg (CORS *, anonymous unlisted JSON fallback)
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch('https://api.paste.gg/v1/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visibility: 'unlisted',
          files: [{ name: 'arena.json', content: { format: 'text', value: jsonBody } }]
        }),
        signal: controller.signal
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const pasteId = data && data.result && data.result.id;
        if (pasteId) {
          const metaRes = await fetch(`https://api.paste.gg/v1/pastes/${pasteId}`);
          if (metaRes.ok) {
            const meta = await metaRes.json();
            const fileId = meta && meta.result && meta.result.files && meta.result.files[0] && meta.result.files[0].id;
            if (fileId) {
              return `g:${pasteId}:${fileId}`;
            }
          }
        }
      }
    } catch (e) {
      console.warn('paste.gg save error:', e);
    }

    return null;
  }

  async fetchCloudConfig(pasteKey) {
    if (!pasteKey) return null;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      let url = '';
      if (pasteKey.startsWith('g:')) {
        const parts = pasteKey.split(':');
        if (parts.length === 3) {
          url = `https://api.paste.gg/v1/pastes/${encodeURIComponent(parts[1])}/files/${encodeURIComponent(parts[2])}/raw`;
        }
      } else {
        const cleanKey = pasteKey.startsWith('d:') ? pasteKey.slice(2) : pasteKey;
        url = `https://api.pastes.dev/${encodeURIComponent(cleanKey)}`;
      }
      if (!url) return null;

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      const data = await res.json();
      return unpackV3Config(data);
    } catch (e) {
      console.warn('Cloud config load error:', e);
      return null;
    }
  }

  async fetchShortUrl(longUrl) {
    // Only true HTTP 301/302 direct-redirect APIs (never v.gd or clck.ru interstitials)
    const tryIsGdFetch = async () => {
      if (longUrl.length > 4500) return null;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      try {
        const res = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`, {
          signal: controller.signal
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.shorturl && data.shorturl.startsWith('http')) {
            return data.shorturl.trim();
          }
        }
      } finally {
        clearTimeout(timer);
      }
      return null;
    };

    const tryIsGdJsonp = async () => {
      if (longUrl.length > 4500) return null;
      const data = await this.jsonpRequest(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`, 'callback', 3500);
      return (data && data.shorturl && data.shorturl.startsWith('http')) ? data.shorturl.trim() : null;
    };

    const tryShrtr = async () => {
      if (longUrl.length > 2048) return null;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      try {
        const res = await fetch('https://shrtr.top/api/v1/shorten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: longUrl }),
          signal: controller.signal
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.short_url && data.short_url.startsWith('http')) {
            return data.short_url.trim();
          }
        }
      } finally {
        clearTimeout(timer);
      }
      return null;
    };

    const tryUrlVanish = async () => {
      if (longUrl.length > 2048) return null;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      try {
        const res = await fetch(`https://urlvanish.com/api/shorten?url=${encodeURIComponent(longUrl)}`, {
          signal: controller.signal
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.shorturl && data.shorturl.startsWith('http')) {
            return data.shorturl.trim();
          }
        }
      } finally {
        clearTimeout(timer);
      }
      return null;
    };

    const trySpooMe = async () => {
      if (longUrl.length > 15000) return null;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4500);
      try {
        const res = await fetch('https://spoo.me/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: 'url=' + encodeURIComponent(longUrl),
          signal: controller.signal
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.short_url && data.short_url.startsWith('http')) {
            return data.short_url.trim().replace(/^http:\/\//i, 'https://');
          }
        }
      } finally {
        clearTimeout(timer);
      }
      return null;
    };

    const providers = [tryIsGdFetch, tryShrtr, tryUrlVanish, trySpooMe, tryIsGdJsonp];
    for (const runProvider of providers) {
      try {
        const result = await runProvider();
        if (result) return result;
      } catch (e) {
        console.warn('Shortener provider error:', e);
      }
    }

    return longUrl;
  }

  /* ========================================================
   * SHARING & QR CODE FOR MOBILE & PC
   * ======================================================== */
  async generateAndCopyShareLink(mode = 'mode1') {
    this.readCurrentStudioInputs(mode);

    // Clone config so the active high-res roster in Studio/Game is NEVER altered or degraded
    const config = JSON.parse(JSON.stringify(mode === 'mode1' ? this.mode1Config : this.mode2Config));
    const publicBase = 'https://vuthedan168-oss.github.io/interactive-choice-suite/';

    const hasLocalImages = mode === 'mode2' && Array.isArray(config.roster) && config.roster.some(
      c => c.avatar && c.avatar.startsWith('data:image/')
    );

    // Try fast compact hash URL directly if there are no uploaded local photos and serialized payload <= 1800 chars
    if (!hasLocalImages) {
      const compactSerialized = serializeConfig(mode, config);
      if (compactSerialized && compactSerialized.length <= 1800) {
        this.openShareModal(`${publicBase}?play=1&mode=${mode}#data=${compactSerialized}`);
        return;
      }
    }

    // Store full-res config in cloud paste so link stays ~88 chars AND preserves 100% original sharp photos
    this.showToast('⏳ Đang đóng gói dữ liệu & ảnh gốc sắc nét...');
    const pasteKey = await this.saveCloudConfig(mode, config);
    if (pasteKey) {
      this.openShareModal(`${publicBase}?play=1&mode=${mode}&p=${encodeURIComponent(pasteKey)}`);
      return;
    }

    // Fallback when offline/cloud blocked: use #data= hash fragment (never ?data=, prevents 414 URI Too Long)
    if (mode === 'mode2') {
      await this.sanitizeRosterImages(config.roster);
    }

    let serialized = serializeConfig(mode, config);
    if (!serialized) {
      alert('Lỗi tạo link chia sẻ!');
      return;
    }

    let directShareUrl = `${publicBase}?play=1&mode=${mode}#data=${serialized}`;
    if (mode === 'mode2' && directShareUrl.length > 14800 && Array.isArray(config.roster)) {
      config.roster.forEach(c => {
        if (c.avatar && c.avatar.startsWith('data:image/')) {
          c.avatar = '';
        }
      });
      serialized = serializeConfig(mode, config) || serialized;
      directShareUrl = `${publicBase}?play=1&mode=${mode}#data=${serialized}`;
    }

    this.openShareModal(directShareUrl);
  }

  openShareModal(directShareUrl) {
    const modal = document.getElementById('modal-share-link');
    const input = document.getElementById('share-url-input');
    const qrImg = document.getElementById('share-qr-image');
    const openBtn = document.getElementById('btn-open-share-link');
    const copyBtn = document.getElementById('btn-copy-modal-link');
    const toggleBtn = document.getElementById('btn-toggle-link-type');
    const typeBadge = document.getElementById('share-link-type-badge');

    let currentShowingUrl = directShareUrl;
    let shortUrl = null;
    let isShowingShort = true;

    const setQrUrl = (targetUrl) => {
      if (!qrImg) return;
      if (targetUrl && targetUrl.length <= 2400) {
        qrImg.classList.remove('opacity-40');
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(targetUrl)}`;
      } else {
        qrImg.removeAttribute('src');
        qrImg.alt = 'Link quá dài để tạo mã QR trực tiếp';
      }
    };

    if (input) {
      input.value = '⚡ Đang tạo link rút gọn trỏ thẳng vào game...';
    }
    if (qrImg) {
      qrImg.removeAttribute('src');
      qrImg.classList.add('opacity-40');
      qrImg.alt = 'Đang tạo mã QR...';
    }
    if (toggleBtn) {
      toggleBtn.classList.add('hidden');
    }
    if (openBtn) {
      openBtn.onclick = () => window.open(currentShowingUrl, '_blank');
    }
    if (typeBadge) {
      typeBadge.textContent = '⚡ Đang tạo link rút gọn...';
      typeBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 animate-pulse';
    }

    // Fetch direct-redirect shortened URL asynchronously before generating QR
    this.fetchShortUrl(directShareUrl).then(sUrl => {
      if (sUrl && sUrl !== directShareUrl) {
        shortUrl = sUrl;
        currentShowingUrl = shortUrl;
        if (input) {
          input.value = shortUrl;
          input.select();
        }
        setQrUrl(shortUrl);
        if (typeBadge) {
          typeBadge.textContent = '⚡ Link rút gọn trực tiếp (vào thẳng màn chơi)';
          typeBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30';
        }
        if (toggleBtn) {
          toggleBtn.classList.remove('hidden');
          toggleBtn.textContent = 'Chuyển sang xem link gốc';
        }
        this.copyTextToClipboard(shortUrl).then(() => {
          this.showToast('🎉 Đã tạo & tự động sao chép link rút gọn!');
        }).catch(() => {});
      } else {
        currentShowingUrl = directShareUrl;
        if (input) input.value = directShareUrl;
        setQrUrl(directShareUrl);
        if (typeBadge) {
          typeBadge.textContent = 'Link trực tiếp';
          typeBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30';
        }
      }
    });

    if (toggleBtn) {
      toggleBtn.onclick = () => {
        if (!shortUrl) return;
        isShowingShort = !isShowingShort;
        currentShowingUrl = isShowingShort ? shortUrl : directShareUrl;
        if (input) {
          input.value = currentShowingUrl;
          input.select();
        }
        setQrUrl(currentShowingUrl);
        toggleBtn.textContent = isShowingShort ? 'Chuyển sang xem link gốc' : 'Chuyển sang xem link rút gọn';
      };
    }

    const doCopy = () => {
      const urlToCopy = currentShowingUrl;
      this.copyTextToClipboard(urlToCopy).then(() => {
        const isShort = shortUrl && urlToCopy === shortUrl;
        this.showToast(isShort ? '🎉 Đã sao chép link rút gọn trực tiếp!' : '🎉 Đã sao chép link người chơi!');
      });
    };

    if (copyBtn) copyBtn.onclick = doCopy;

    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      };
      modal.classList.remove('hidden');
    }
    this.showToast('🎉 Đã tạo link chia sẻ!');
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
