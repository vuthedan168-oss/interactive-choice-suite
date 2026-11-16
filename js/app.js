/**
 * Interactive Choice Suite - Core Application
 */

class App {
  constructor() {
    this.currentMode = 'mode1'; // 'mode1' | 'mode2'
    this.currentView = 'studio'; // 'studio' | 'player'
    this.isMuted = false;

    // Mode 1 State
    this.mode1Config = { ...DEFAULT_MODE1_CONFIG };
    this.mode1State = {
      isCelebrated: false
    };

    // Mode 2 State
    this.mode2Config = {
      title: DEFAULT_MODE2_CONFIG.title,
      subtitle: DEFAULT_MODE2_CONFIG.subtitle,
      roster: JSON.parse(JSON.stringify(DEFAULT_MODE2_CONFIG.roster)),
      riggedWinnerId: "",
      riggedFinalBoss: true
    };
    this.mode2Game = {
      queue: [],
      currentKing: null,
      currentChallenger: null,
      roundNumber: 1,
      totalRounds: 1,
      kingStreak: 0,
      isFinished: false,
      winner: null,
      isCurrentMatchRigged: false
    };

    this.init();
  }

  init() {
    this.checkUrlRouting();
    this.bindGlobalEvents();
    this.renderStudioMode1();
    this.renderStudioMode2();

    if (this.currentView === 'player') {
      this.launchPlayerView();
    } else {
      this.switchMode(this.currentMode);
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
    } else {
      this.currentView = 'studio';
      const modeParam = params.get('mode');
      if (modeParam === 'mode2') this.currentMode = 'mode2';
    }
  }

  bindGlobalEvents() {
    // Mode Switcher Tabs in Studio
    const tabMode1 = document.getElementById('tab-mode1');
    const tabMode2 = document.getElementById('tab-mode2');
    if (tabMode1) tabMode1.addEventListener('click', () => this.switchMode('mode1'));
    if (tabMode2) tabMode2.addEventListener('click', () => this.switchMode('mode2'));

    // Sound toggle buttons
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

    // Header Studio button in Player view
    const btnGoStudio = document.getElementById('btn-go-studio');
    if (btnGoStudio) {
      btnGoStudio.addEventListener('click', () => {
        evasionEngine.detach();
        const url = new URL(window.location.href);
        url.search = '';
        url.hash = '';
        window.history.pushState({}, '', url.toString());
        this.currentView = 'studio';
        this.switchMode(this.currentMode);
      });
    }

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
  }

  switchMode(mode) {
    this.currentMode = mode;
    evasionEngine.detach();

    const tabMode1 = document.getElementById('tab-mode1');
    const tabMode2 = document.getElementById('tab-mode2');
    const panelMode1 = document.getElementById('studio-panel-mode1');
    const panelMode2 = document.getElementById('studio-panel-mode2');
    const studioContainer = document.getElementById('creator-studio-container');
    const playerContainer = document.getElementById('player-experience-container');
    const playerBanner = document.getElementById('player-top-banner');

    studioContainer.classList.remove('hidden');
    playerContainer.classList.add('hidden');
    playerBanner.classList.add('hidden');

    if (mode === 'mode1') {
      tabMode1.className = 'flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30 transition-all';
      tabMode2.className = 'flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all';
      panelMode1.classList.remove('hidden');
      panelMode2.classList.add('hidden');
    } else {
      tabMode2.className = 'flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 transition-all';
      tabMode1.className = 'flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all';
      panelMode1.classList.add('hidden');
      panelMode2.classList.remove('hidden');
    }

    lucide.createIcons();
  }

  /* ========================================================
   * MODE 1: CREATOR STUDIO & RUNAWAY LOGIC
   * ======================================================== */
  renderStudioMode1() {
    const questionInput = document.getElementById('m1-question');
    const subtitleInput = document.getElementById('m1-subtitle');
    const targetInput = document.getElementById('m1-target-text');
    const rejectInput = document.getElementById('m1-reject-text');
    const celebTitleInput = document.getElementById('m1-celeb-title');
    const celebMsgInput = document.getElementById('m1-celeb-msg');
    const customGifInput = document.getElementById('m1-custom-gif');

    if (questionInput) questionInput.value = this.mode1Config.question;
    if (subtitleInput) subtitleInput.value = this.mode1Config.subtitle;
    if (targetInput) targetInput.value = this.mode1Config.targetText;
    if (rejectInput) rejectInput.value = this.mode1Config.rejectText;
    if (celebTitleInput) celebTitleInput.value = this.mode1Config.celebrationTitle;
    if (celebMsgInput) celebMsgInput.value = this.mode1Config.celebrationMessage;
    if (customGifInput) customGifInput.value = this.mode1Config.celebrationGif;

    // Listeners for live update
    const updateHandler = () => {
      this.mode1Config.question = questionInput.value.trim() || DEFAULT_MODE1_CONFIG.question;
      this.mode1Config.subtitle = subtitleInput.value.trim();
      this.mode1Config.targetText = targetInput.value.trim() || DEFAULT_MODE1_CONFIG.targetText;
      this.mode1Config.rejectText = rejectInput.value.trim() || DEFAULT_MODE1_CONFIG.rejectText;
      this.mode1Config.celebrationTitle = celebTitleInput.value.trim() || DEFAULT_MODE1_CONFIG.celebrationTitle;
      this.mode1Config.celebrationMessage = celebMsgInput.value.trim() || DEFAULT_MODE1_CONFIG.celebrationMessage;
      if (customGifInput.value.trim()) {
        this.mode1Config.celebrationGif = customGifInput.value.trim();
      }
    };

    [questionInput, subtitleInput, targetInput, rejectInput, celebTitleInput, celebMsgInput].forEach(inp => {
      if (inp) inp.addEventListener('input', updateHandler);
    });

    if (customGifInput) {
      customGifInput.addEventListener('change', () => {
        if (customGifInput.value.trim()) {
          this.mode1Config.celebrationGif = customGifInput.value.trim();
          this.highlightSelectedGif(null);
        }
      });
    }

    // Render Theme Buttons
    const themeContainer = document.getElementById('m1-theme-picker');
    if (themeContainer) {
      themeContainer.innerHTML = '';
      Object.keys(THEMES).forEach(themeKey => {
        const theme = THEMES[themeKey];
        const isSelected = this.mode1Config.theme === themeKey;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
          isSelected
            ? 'border-rose-500 bg-rose-500/20 text-white shadow-md shadow-rose-500/20 ring-1 ring-rose-500'
            : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20'
        }`;
        btn.innerHTML = `
          <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 text-rose-400">
            <i data-lucide="${theme.icon}" class="w-4 h-4"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-white">${theme.name}</div>
            <div class="text-[10px] text-slate-400">Phong cách màu riêng biệt</div>
          </div>
        `;
        btn.addEventListener('click', () => {
          this.mode1Config.theme = themeKey;
          this.renderStudioMode1();
        });
        themeContainer.appendChild(btn);
      });
    }

    // Render Curated GIF Picker
    const gifGrid = document.getElementById('m1-gif-grid');
    if (gifGrid) {
      gifGrid.innerHTML = '';
      CURATED_GIFS.forEach(gif => {
        const isSelected = this.mode1Config.celebrationGif === gif.url;
        const card = document.createElement('div');
        card.className = `cursor-pointer rounded-xl overflow-hidden border relative group transition-all ${
          isSelected
            ? 'border-rose-500 ring-2 ring-rose-500 scale-[1.02]'
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
          if (customGifInput) customGifInput.value = gif.url;
          this.renderStudioMode1();
        });
        gifGrid.appendChild(card);
      });
    }

    lucide.createIcons();
  }

  highlightSelectedGif(selectedUrl) {
    const cards = document.querySelectorAll('#m1-gif-grid > div');
    cards.forEach(card => {
      card.classList.remove('border-rose-500', 'ring-2', 'ring-rose-500', 'scale-[1.02]');
      card.classList.add('border-white/10', 'opacity-75');
    });
  }

  /* ========================================================
   * MODE 2: CREATOR STUDIO & ROSTER MANAGEMENT
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
      });
    }

    if (subtitleInput) {
      subtitleInput.value = this.mode2Config.subtitle;
      subtitleInput.addEventListener('input', () => {
        this.mode2Config.subtitle = subtitleInput.value.trim() || DEFAULT_MODE2_CONFIG.subtitle;
      });
    }

    if (riggedFinalBossCheck) {
      riggedFinalBossCheck.checked = this.mode2Config.riggedFinalBoss;
      riggedFinalBossCheck.addEventListener('change', () => {
        this.mode2Config.riggedFinalBoss = riggedFinalBossCheck.checked;
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
        this.renderStudioMode2Roster();
      });
    }

    // Bind Add Candidate Modal Button
    const btnOpenAddModal = document.getElementById('btn-open-add-candidate');
    if (btnOpenAddModal) {
      btnOpenAddModal.onclick = () => this.openAddCandidateModal();
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
        if (confirm('Khôi phục danh sách 16 người nổi tiếng mặc định ban đầu?')) {
          this.mode2Config.roster = JSON.parse(JSON.stringify(DEFAULT_CELEBRITIES));
          this.mode2Config.riggedWinnerId = "";
          this.renderStudioMode2();
          this.showToast('Đã khôi phục danh sách mặc định!');
        }
      };
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
      row.className = `p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
        isRigged
          ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/20'
          : 'bg-slate-900/60 border-white/10 hover:border-white/20'
      }`;

      const initials = candidate.initials || candidate.name.substring(0, 2).toUpperCase();
      const avatarContent = candidate.avatar
        ? `<div class="relative w-10 h-10 rounded-full overflow-hidden">
             <img src="${candidate.avatar}" class="w-full h-full object-cover ring-2 ${isRigged ? 'ring-amber-400' : 'ring-white/20'}" onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');" />
             <div class="hidden w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center font-bold text-xs text-white ring-2 ring-amber-400/50">${initials}</div>
           </div>`
        : `<div class="w-10 h-10 rounded-full bg-gradient-to-br ${candidate.color || 'from-amber-500 to-red-600'} flex items-center justify-center font-bold text-xs text-white ring-2 ring-amber-400/50">${initials}</div>`;

      row.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          <div class="relative shrink-0">
            ${avatarContent}
            ${isRigged ? '<span class="absolute -top-1 -right-1 text-sm">👑</span>' : ''}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-400">#${index + 1}</span>
              <span class="text-sm font-bold text-white truncate ${isRigged ? 'text-amber-300' : ''}">${candidate.name}</span>
              ${isRigged ? '<span class="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950 uppercase">Vua chỉ định</span>' : ''}
            </div>
            <div class="text-xs text-slate-400 truncate">${candidate.field}</div>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button type="button" class="btn-set-rigged p-2 rounded-lg ${isRigged ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 hover:text-amber-300 hover:bg-white/10'} text-xs font-bold transition-all" title="Chỉ định nhân vật này chắc chắn thắng">
            <i data-lucide="crown" class="w-4 h-4"></i>
          </button>
          <button type="button" class="btn-delete-candidate p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 text-xs transition-all" title="Xóa">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;

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
        this.renderStudioMode2();
        this.showToast(`Đã xóa [${candidate.name}]`);
      };

      listContainer.appendChild(row);
    });

    lucide.createIcons();
  }

  openAddCandidateModal() {
    const modal = document.getElementById('modal-add-candidate');
    const nameInp = document.getElementById('modal-cand-name');
    const fieldInp = document.getElementById('modal-cand-field');
    const avatarInp = document.getElementById('modal-cand-avatar');
    const avatarFileInp = document.getElementById('modal-cand-file');
    const btnSave = document.getElementById('btn-save-candidate');
    const btnCancel = document.getElementById('btn-cancel-candidate');

    nameInp.value = '';
    fieldInp.value = '';
    avatarInp.value = '';
    avatarFileInp.value = '';

    modal.classList.remove('hidden');

    let base64Image = '';
    avatarFileInp.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          base64Image = loadEvent.target.result;
          avatarInp.value = base64Image;
        };
        reader.readAsDataURL(file);
      }
    };

    btnCancel.onclick = () => {
      modal.classList.add('hidden');
    };

    btnSave.onclick = () => {
      const name = nameInp.value.trim();
      const field = fieldInp.value.trim() || 'Người nổi tiếng';
      let avatar = avatarInp.value.trim();

      if (!name) {
        alert('Vui lòng nhập tên nhân vật!');
        return;
      }

      const initials = name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      const newCandidate = {
        id: `celeb-custom-${Date.now()}`,
        name: name,
        field: field,
        avatar: avatar || '',
        initials: initials || 'VIP',
        color: 'from-amber-400 to-rose-600'
      };

      this.mode2Config.roster.push(newCandidate);
      modal.classList.add('hidden');
      this.renderStudioMode2();
      this.showToast(`Đã thêm thành công: ${name}`);
    };
  }

  addCreatorAsFinalBoss() {
    const creatorName = prompt('Nhập tên của bạn (người tạo thử thách):', 'Tôi (Trùm cuối)');
    if (!creatorName) return;

    const creatorField = prompt('Nhập danh hiệu / nghề nghiệp của bạn:', 'Nhân vật quyền lực nhất vũ trụ');
    const avatarUrl = prompt('Nhập link ảnh của bạn (hoặc để trống để dùng avatar hoàng gia):', '');

    const id = `celeb-creator-${Date.now()}`;
    const initials = creatorName
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const creatorCandidate = {
      id: id,
      name: creatorName,
      field: creatorField || 'Vua Đương Triều',
      avatar: avatarUrl || '',
      initials: initials || 'ME',
      color: 'from-amber-400 via-yellow-300 to-red-600'
    };

    this.mode2Config.roster.push(creatorCandidate);
    this.mode2Config.riggedWinnerId = id;
    this.mode2Config.riggedFinalBoss = true;

    this.renderStudioMode2();
    this.showToast(`🔥 Đã cài đặt [${creatorName}] làm Trùm Cuối và chắc chắn thắng!`);
  }

  /* ========================================================
   * PLAYER EXPERIENCE MODE
   * ======================================================== */
  previewAsPlayer(mode) {
    this.currentMode = mode;
    this.launchPlayerView();
  }

  launchPlayerView() {
    evasionEngine.detach();
    this.currentView = 'player';

    const studioContainer = document.getElementById('creator-studio-container');
    const playerContainer = document.getElementById('player-experience-container');
    const playerBanner = document.getElementById('player-top-banner');

    studioContainer.classList.add('hidden');
    playerContainer.classList.remove('hidden');
    playerBanner.classList.remove('hidden');

    const bannerTitle = document.getElementById('player-banner-gamename');
    if (this.currentMode === 'mode1') {
      bannerTitle.textContent = 'Do You Love Me? - Nút Chạy Trốn';
      this.startMode1PlayerGame();
    } else {
      bannerTitle.textContent = this.mode2Config.title || 'Vua Giữ Đài - Đấu Loại Thảm Đỏ';
      this.startMode2KnockoutGame();
    }

    lucide.createIcons();
  }

  /* ========================================================
   * MODE 1: PLAYER GAME ENGINE
   * ======================================================== */
  startMode1PlayerGame() {
    evasionEngine.detach();
    const playerContainer = document.getElementById('player-experience-container');
    const theme = THEMES[this.mode1Config.theme] || THEMES.love;

    playerContainer.className = `min-h-[85vh] flex items-center justify-center p-4 transition-colors duration-500 bg-gradient-to-br ${theme.bgGradient}`;

    playerContainer.innerHTML = `
      <div id="m1-game-box" class="w-full max-w-xl mx-auto glass-panel rounded-3xl p-8 md:p-12 text-center border ${theme.cardBorder} shadow-2xl relative overflow-visible">
        
        <!-- Question Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.badgeColor} border text-xs font-bold uppercase tracking-wider mb-6">
          <i data-lucide="${theme.icon}" class="w-3.5 h-3.5"></i>
          <span>Thử Thách Lựa Chọn</span>
        </div>

        <!-- Question Title -->
        <h1 id="m1-display-question" class="text-2xl md:text-4xl font-black text-white mb-4 leading-tight">
          ${this.escapeHtml(this.mode1Config.question)}
        </h1>

        <!-- Subtitle -->
        ${this.mode1Config.subtitle ? `<p class="text-sm md:text-base text-slate-300/90 mb-10 max-w-md mx-auto">${this.escapeHtml(this.mode1Config.subtitle)}</p>` : '<div class="mb-10"></div>'}

        <!-- Buttons Arena -->
        <div id="m1-buttons-arena" class="relative min-h-[140px] flex flex-wrap items-center justify-center gap-6 md:gap-8">
          
          <!-- Target Button (The Forced Choice) -->
          <button id="m1-target-btn" type="button" class="relative z-10 px-8 py-4 rounded-2xl font-black text-lg md:text-xl transition-all transform hover:scale-105 active:scale-95 shadow-xl ${theme.targetBtnClass}">
            ${this.escapeHtml(this.mode1Config.targetText)}
          </button>

          <!-- Reject Button (The Runaway Choice) -->
          <button id="m1-reject-btn" type="button" class="px-7 py-3.5 rounded-2xl font-bold text-base md:text-lg transition-all ${theme.rejectBtnClass} backdrop-blur-md">
            ${this.escapeHtml(this.mode1Config.rejectText)}
          </button>
        </div>

        <!-- Hint Footer -->
        <div class="mt-8 text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <i data-lucide="info" class="w-3.5 h-3.5"></i>
          <span>Hãy chọn câu trả lời thật lòng từ trái tim nhé!</span>
        </div>
      </div>
    `;

    lucide.createIcons();

    // Hook up Runaway Evasion Engine to Reject button
    const rejectBtn = document.getElementById('m1-reject-btn');
    const targetBtn = document.getElementById('m1-target-btn');

    evasionEngine.attach(rejectBtn, {
      proximityRadius: 90,
      quips: DEFAULT_RUNAWAY_QUIPS
    });

    // Hook up Celebration Event to Target button
    targetBtn.onclick = () => {
      evasionEngine.detach();
      this.celebrateMode1();
    };
  }

  celebrateMode1() {
    sounds.playSuccess();
    this.triggerConfetti();

    const gameBox = document.getElementById('m1-game-box');
    const theme = THEMES[this.mode1Config.theme] || THEMES.love;

    gameBox.innerHTML = `
      <div class="space-y-6 animate-pop-in">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.badgeColor} border text-xs font-bold uppercase tracking-wider">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
          <span>Lựa Chọn Tuyệt Vời Nhất!</span>
        </div>

        <h2 class="text-2xl md:text-4xl font-black text-white leading-tight">
          ${this.escapeHtml(this.mode1Config.celebrationTitle)}
        </h2>

        <!-- Celebration GIF -->
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
            <span>Gửi câu này cho người khác</span>
          </button>
        </div>
      </div>
    `;

    lucide.createIcons();

    document.getElementById('m1-replay-btn').onclick = () => {
      this.startMode1PlayerGame();
    };

    document.getElementById('m1-share-btn').onclick = () => {
      this.generateAndCopyShareLink('mode1');
    };
  }

  /* ========================================================
   * MODE 2: PLAYER GAME ENGINE (VUA GIỮ ĐÀI)
   * ======================================================== */
  startMode2KnockoutGame() {
    evasionEngine.detach();
    const roster = JSON.parse(JSON.stringify(this.mode2Config.roster));

    if (roster.length < 2) {
      alert('Danh sách cần tối thiểu 2 người!');
      this.switchMode('mode2');
      return;
    }

    const riggedId = this.mode2Config.riggedWinnerId;
    const finalBossMode = this.mode2Config.riggedFinalBoss;

    let finalBoss = null;
    let pool = [...roster];

    // If final boss is enabled and a rigged candidate is chosen, withhold them for the grand championship duel
    if (riggedId && finalBossMode) {
      const bossIdx = pool.findIndex(c => c.id === riggedId);
      if (bossIdx !== -1) {
        finalBoss = pool.splice(bossIdx, 1)[0];
      }
    }

    // Initialize King of the Hill game state
    const currentKing = pool.shift();
    const currentChallenger = pool.shift();

    if (finalBoss) {
      pool.push(finalBoss); // push to very end of queue as final boss!
    }

    this.mode2Game = {
      queue: pool,
      currentKing: currentKing,
      currentChallenger: currentChallenger,
      roundNumber: 1,
      totalRounds: roster.length - 1,
      kingStreak: 1,
      isFinished: false,
      winner: null
    };

    this.renderMode2Duel();
  }

  renderMode2Duel() {
    evasionEngine.detach();
    const playerContainer = document.getElementById('player-experience-container');
    playerContainer.className = 'min-h-[85vh] p-4 flex items-center justify-center bg-gradient-to-br from-slate-950 via-zinc-950 to-neutral-950';

    const { currentKing, currentChallenger, roundNumber, totalRounds, kingStreak } = this.mode2Game;
    const isFinalRound = this.mode2Game.queue.length === 0;

    // Check if current face-off involves the rigged candidate
    const riggedId = this.mode2Config.riggedWinnerId;
    const hasRiggedWinner = Boolean(riggedId);
    const isKingRigged = riggedId && currentKing.id === riggedId;
    const isChallengerRigged = riggedId && currentChallenger.id === riggedId;
    const isRiggedMatch = hasRiggedWinner && (isKingRigged || isChallengerRigged);

    playerContainer.innerHTML = `
      <div class="w-full max-w-4xl mx-auto space-y-6">
        
        <!-- Header & Progress -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider">
            <i data-lucide="flame" class="w-3.5 h-3.5 text-amber-400"></i>
            <span>${isFinalRound ? 'TRẬN CHUNG KẾT ĐỈNH CAO' : `VÒNG ${roundNumber} / ${totalRounds} • VUA GIỮ ĐÀI`}</span>
          </div>

          <h1 class="text-2xl md:text-4xl font-black text-white">
            ${this.escapeHtml(this.mode2Config.title)}
          </h1>
          <p class="text-xs md:text-sm text-slate-400">
            ${this.escapeHtml(this.mode2Config.subtitle)}
          </p>

          <!-- Progress Bar -->
          <div class="w-full max-w-md mx-auto bg-slate-900 rounded-full h-2.5 overflow-hidden border border-white/10 mt-3">
            <div class="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-500" style="width: ${(roundNumber / totalRounds) * 100}%"></div>
          </div>
        </div>

        <!-- Duel Ring: 2 Big Cards Side-by-Side -->
        <div id="m2-arena" class="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center justify-center pt-2">
          
          <!-- LEFT CARD: CURRENT KING -->
          <div id="card-king" class="carpet-card glass-panel-gold rounded-3xl p-6 text-center border cursor-pointer select-none group relative">
            <div class="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] shadow-lg shadow-amber-400/30">
              <span>👑 VUA ĐÀI</span>
              <span class="opacity-80">(${kingStreak} trận thắng)</span>
            </div>

            <div class="w-32 h-32 md:w-44 md:h-44 mx-auto rounded-2xl overflow-hidden my-4 border-2 border-amber-400/50 shadow-2xl relative bg-slate-900">
              ${this.renderCardImage(currentKing)}
            </div>

            <h3 class="text-xl md:text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
              ${this.escapeHtml(currentKing.name)}
            </h3>
            <p class="text-xs md:text-sm text-slate-400 mt-1 mb-5">
              ${this.escapeHtml(currentKing.field)}
            </p>

            <button type="button" class="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 group-hover:shadow-amber-400/60 transition-all flex items-center justify-center gap-2">
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>GIỮ LẠI VUA NÀY</span>
            </button>
          </div>

          <!-- VS Badge In Center -->
          <div class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div class="w-16 h-16 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center vs-badge shadow-2xl">
              <span class="text-xl font-black italic gold-text">VS</span>
            </div>
          </div>

          <!-- RIGHT CARD: CHALLENGER -->
          <div id="card-challenger" class="carpet-card glass-panel rounded-3xl p-6 text-center border border-white/10 cursor-pointer select-none group relative">
            <div class="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white font-bold text-[11px] shadow-lg shadow-rose-500/30">
              <i data-lucide="swords" class="w-3.5 h-3.5"></i>
              <span>NGƯỜI KHIÊU CHIẾN</span>
            </div>

            <div class="w-32 h-32 md:w-44 md:h-44 mx-auto rounded-2xl overflow-hidden my-4 border-2 border-white/20 shadow-2xl relative bg-slate-900">
              ${this.renderCardImage(currentChallenger)}
            </div>

            <h3 class="text-xl md:text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
              ${this.escapeHtml(currentChallenger.name)}
            </h3>
            <p class="text-xs md:text-sm text-slate-400 mt-1 mb-5">
              ${this.escapeHtml(currentChallenger.field)}
            </p>

            <button type="button" class="w-full py-3.5 rounded-xl font-black text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 group-hover:border-amber-400/50 transition-all flex items-center justify-center gap-2">
              <i data-lucide="trophy" class="w-4 h-4"></i>
              <span>LẬT ĐỔ NGÔI VƯƠNG</span>
            </button>
          </div>

        </div>

        <!-- Footer status -->
        <div class="text-center text-xs text-slate-400 pt-2">
          Còn lại <strong>${this.mode2Game.queue.length}</strong> đối thủ đang chờ bước lên thảm đỏ
        </div>
      </div>
    `;

    lucide.createIcons();

    const kingCard = document.getElementById('card-king');
    const challengerCard = document.getElementById('card-challenger');

    // ========================================================
    // RIGGED MECHANIC: RUNAWAY RIVAL CARD!
    // ========================================================
    if (isRiggedMatch) {
      const rivalCard = isKingRigged ? challengerCard : kingCard;
      const favoredCard = isKingRigged ? kingCard : challengerCard;
      const favoredCandidate = isKingRigged ? currentKing : currentChallenger;

      // The entire rival card runs away whenever mouse gets near or attempts to click it!
      evasionEngine.attach(rivalCard, {
        proximityRadius: 100,
        quips: [
          `Ủa tính chọn đối thủ hả? ${favoredCandidate.name} mới là Quán Quân! 👑`,
          "Không có cửa bấm vào đây đâu nha! 😜",
          "Vua đã được chỉ định rồi, bấm người kế bên đi! 👉",
          "Thua đài rồi, né thôi! 🏃‍♂️💨",
          "Né chiêu đỉnh cao! Nhận thua đi haha! 🏆"
        ]
      });

      // Clicking the favored card selects them and advances!
      favoredCard.onclick = () => {
        evasionEngine.detach();
        sounds.playSelect();
        this.selectCandidate(favoredCandidate.id);
      };
    } else {
      // Normal Fair Play Match
      kingCard.onclick = () => {
        sounds.playSelect();
        this.selectCandidate(currentKing.id);
      };

      challengerCard.onclick = () => {
        sounds.playWhoosh();
        this.selectCandidate(currentChallenger.id);
      };
    }
  }

  selectCandidate(chosenId) {
    const { currentKing, currentChallenger, queue } = this.mode2Game;

    if (chosenId === currentKing.id) {
      // King keeps throne
      this.mode2Game.kingStreak++;
    } else {
      // Challenger dethrones king!
      this.mode2Game.currentKing = currentChallenger;
      this.mode2Game.kingStreak = 1;
    }

    if (queue.length > 0) {
      // Next round with new challenger
      this.mode2Game.currentChallenger = queue.shift();
      this.mode2Game.roundNumber++;
      this.renderMode2Duel();
    } else {
      // Tournament finished! Crown the winner!
      this.mode2Game.isFinished = true;
      this.mode2Game.winner = this.mode2Game.currentKing;
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
      <div class="w-full max-w-2xl mx-auto glass-panel-gold rounded-3xl p-8 md:p-12 text-center border border-amber-400 shadow-2xl relative overflow-hidden animate-pop-in">
        
        <!-- Golden Aura Ring -->
        <div class="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-red-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Trophy & Crown -->
        <div class="relative inline-block my-4">
          <div class="text-6xl trophy-glow">👑</div>
        </div>

        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-4">
          <i data-lucide="crown" class="w-4 h-4 text-amber-400"></i>
          <span>QUÁN QUÂN TỐI THƯỢNG THẢM ĐỎ</span>
        </div>

        <!-- Champion Photo -->
        <div class="w-36 h-36 md:w-52 md:h-52 mx-auto rounded-3xl overflow-hidden border-4 border-amber-400 shadow-2xl relative my-6 bg-slate-900 ring-8 ring-amber-400/20">
          ${this.renderCardImage(winner)}
        </div>

        <h2 class="text-3xl md:text-5xl font-black gold-text mb-2">
          ${this.escapeHtml(winner.name)}
        </h2>
        <p class="text-base text-slate-300 font-medium mb-6">
          ${this.escapeHtml(winner.field)}
        </p>

        <!-- Stats Card -->
        <div class="grid grid-cols-2 gap-4 max-w-md mx-auto p-4 rounded-2xl bg-white/5 border border-white/10 mb-8">
          <div>
            <div class="text-xs text-slate-400 font-bold uppercase">Tổng Số Vòng Đấu</div>
            <div class="text-2xl font-black text-white mt-1">${this.mode2Game.totalRounds} Trận</div>
          </div>
          <div>
            <div class="text-xs text-slate-400 font-bold uppercase">Chuỗi Giữ Đài</div>
            <div class="text-2xl font-black text-amber-400 mt-1">${this.mode2Game.kingStreak} Bất Bại</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center justify-center gap-4">
          <button id="m2-restart-btn" type="button" class="px-8 py-4 rounded-2xl font-black text-base bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-xl shadow-amber-500/40 hover:shadow-amber-400/70 transition-all flex items-center gap-2">
            <i data-lucide="rotate-ccw" class="w-5 h-5"></i>
            <span>CHƠI LẠI TỪ ĐẦU</span>
          </button>
          
          <button id="m2-share-btn" type="button" class="px-7 py-4 rounded-2xl font-bold text-base bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2">
            <i data-lucide="share-2" class="w-5 h-5"></i>
            <span>Chia sẻ trận đấu này</span>
          </button>
        </div>

      </div>
    `;

    lucide.createIcons();

    document.getElementById('m2-restart-btn').onclick = () => {
      this.startMode2KnockoutGame();
    };

    document.getElementById('m2-share-btn').onclick = () => {
      this.generateAndCopyShareLink('mode2');
    };
  }

  renderCardImage(candidate) {
    const initials = candidate.initials || candidate.name.substring(0, 2).toUpperCase();
    if (candidate.avatar) {
      return `
        <div class="w-full h-full relative">
          <img src="${candidate.avatar}" alt="${this.escapeHtml(candidate.name)}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');" />
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
   * SHARING & UTILITIES
   * ======================================================== */
  generateAndCopyShareLink(mode) {
    const config = mode === 'mode1' ? this.mode1Config : this.mode2Config;
    const serialized = serializeConfig(mode, config);
    if (!serialized) {
      alert('Lỗi tạo link chia sẻ!');
      return;
    }

    const currentUrl = new URL(window.location.href);
    currentUrl.search = `?play=1&mode=${mode}&data=${serialized}`;
    currentUrl.hash = '';

    const shareUrl = currentUrl.toString();

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      this.showToast('🎉 Đã sao chép link người chơi vào bộ nhớ tạm! Bạn có thể dán và gửi cho bạn bè ngay.');
    }).catch(() => {
      prompt('Hãy sao chép link người chơi dưới đây:', shareUrl);
    });
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
