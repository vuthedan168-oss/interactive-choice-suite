/**
 * Runaway Physics & Proximity Evasion Engine
 * Handles dodging physics for the runaway reject button.
 * Strictly guarantees the button stays within user focus and visible card bounds.
 */

class EvasionEngine {
  constructor() {
    this.activeElement = null;
    this.container = null;
    this.evasionCount = 0;
    this.quips = [...DEFAULT_RUNAWAY_QUIPS];
    this.boundListeners = [];
    this.lastDodgeTime = 0;
    this.cooldownMs = 80;
    this.proximityRadius = 80;
    this.speechBubble = null;
    this.bubbleTimer = null;
  }

  attach(element, options = {}) {
    this.detach();
    if (!element) return;

    this.activeElement = element;
    this.container = options.container || document.body;
    this.evasionCount = 0;
    this.proximityRadius = options.proximityRadius || (window.innerWidth < 768 ? 65 : 85);
    if (options.quips) {
      this.quips = options.quips;
    }

    this.activeElement.classList.add('runaway-target');
    this.createSpeechBubble();

    const onPointerMove = (e) => this.handlePointerMove(e);
    const onTouchStart = (e) => this.handleTouch(e);
    const onMouseEnter = (e) => this.dodge(e);

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    this.activeElement.addEventListener('mouseenter', onMouseEnter);
    this.activeElement.addEventListener('touchstart', onTouchStart, { passive: false });
    this.activeElement.addEventListener('pointerdown', onTouchStart, { passive: false });
    this.activeElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dodge(e);
    });

    this.boundListeners = [
      { target: window, event: 'mousemove', fn: onPointerMove },
      { target: this.activeElement, event: 'mouseenter', fn: onMouseEnter },
      { target: this.activeElement, event: 'touchstart', fn: onTouchStart },
      { target: this.activeElement, event: 'pointerdown', fn: onTouchStart }
    ];
  }

  detach() {
    if (this.boundListeners.length > 0) {
      this.boundListeners.forEach(({ target, event, fn }) => {
        target.removeEventListener(event, fn);
      });
      this.boundListeners = [];
    }

    if (this.speechBubble && this.speechBubble.parentNode) {
      this.speechBubble.parentNode.removeChild(this.speechBubble);
      this.speechBubble = null;
    }

    if (this.activeElement) {
      this.activeElement.classList.remove('runaway-target', 'is-running');
      this.activeElement.style.position = '';
      this.activeElement.style.left = '';
      this.activeElement.style.top = '';
      this.activeElement.style.width = '';
      this.activeElement.style.transform = '';
      this.activeElement.style.zIndex = '';
      this.activeElement = null;
    }

    this.evasionCount = 0;
  }

  createSpeechBubble() {
    if (this.speechBubble) return;
    this.speechBubble = document.createElement('div');
    this.speechBubble.className = 'runaway-speech-bubble hidden';
    document.body.appendChild(this.speechBubble);
  }

  handlePointerMove(e) {
    if (!this.activeElement) return;
    const now = Date.now();
    if (now - this.lastDodgeTime < this.cooldownMs) return;

    const rect = this.activeElement.getBoundingClientRect();
    const elemCenterX = rect.left + rect.width / 2;
    const elemCenterY = rect.top + rect.height / 2;

    const dist = Math.hypot(e.clientX - elemCenterX, e.clientY - elemCenterY);
    if (dist < this.proximityRadius) {
      this.dodge(e);
    }
  }

  handleTouch(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.touches && e.touches[0]) {
      this.dodge(e.touches[0]);
    } else {
      this.dodge(e);
    }
  }

  dodge(e = null) {
    if (!this.activeElement) return;
    const now = Date.now();
    if (now - this.lastDodgeTime < 70) return;
    this.lastDodgeTime = now;
    this.evasionCount++;

    sounds.playBoing();

    // 1. Get exact viewport bounds
    const vpW = window.visualViewport ? window.visualViewport.width : (document.documentElement.clientWidth || window.innerWidth);
    const vpH = window.visualViewport ? window.visualViewport.height : (document.documentElement.clientHeight || window.innerHeight);

    // 2. Measure button size
    const rect = this.activeElement.getBoundingClientRect();
    const elemW = rect.width || 140;
    const elemH = rect.height || 48;

    // 3. Anchor jumping zone inside the active Game Box so button NEVER flies off to monitor edges
    const gameBox = document.getElementById('m1-game-box');
    let minX, maxX, minY, maxY;

    if (gameBox) {
      const boxRect = gameBox.getBoundingClientRect();
      const padX = 20;
      minX = Math.round(boxRect.left + padX);
      maxX = Math.round(boxRect.right - elemW - padX);
      minY = Math.round(boxRect.top + 130); // under question text
      maxY = Math.round(boxRect.bottom - elemH - 24);

      // On narrow mobile devices, ensure min/max are valid
      if (maxX <= minX) {
        minX = Math.max(16, Math.round(boxRect.left));
        maxX = Math.min(vpW - elemW - 16, Math.round(boxRect.right - elemW));
      }
      if (maxY <= minY) {
        minY = Math.max(80, Math.round(boxRect.top + 90));
        maxY = Math.min(vpH - elemH - 30, Math.round(boxRect.bottom - elemH));
      }
    } else {
      const pad = 24;
      minX = pad;
      maxX = vpW - elemW - pad;
      minY = 90;
      maxY = vpH - elemH - 40;
    }

    // Absolute fallback clamp: MUST be within visible viewport
    minX = Math.max(16, minX);
    maxX = Math.min(vpW - elemW - 16, Math.max(minX + 10, maxX));
    minY = Math.max(75, minY);
    maxY = Math.min(vpH - elemH - 30, Math.max(minY + 10, maxY));

    // 4. Cursor position reference
    const cursorX = (e && e.clientX !== undefined) ? e.clientX : (rect.left + elemW / 2);
    const cursorY = (e && e.clientY !== undefined) ? e.clientY : (rect.top + elemH / 2);

    // 5. Candidate sampling: pick point inside the card with max distance from pointer
    let bestX = minX;
    let bestY = minY;
    let maxDist = -1;

    for (let i = 0; i < 12; i++) {
      const candX = minX + Math.random() * (maxX - minX);
      const candY = minY + Math.random() * (maxY - minY);
      const dist = Math.hypot(candX - cursorX, candY - cursorY);
      if (dist > maxDist) {
        maxDist = dist;
        bestX = candX;
        bestY = candY;
      }
    }

    const targetX = Math.round(Math.max(minX, Math.min(maxX, bestX)));
    const targetY = Math.round(Math.max(minY, Math.min(maxY, bestY)));

    const rotation = (Math.random() * 12 - 6).toFixed(1);

    if (!this.activeElement.style.width) {
      this.activeElement.style.width = `${Math.round(elemW)}px`;
    }

    this.activeElement.style.position = 'fixed';
    this.activeElement.style.left = `${targetX}px`;
    this.activeElement.style.top = `${targetY}px`;
    this.activeElement.style.transform = `rotate(${rotation}deg)`;
    this.activeElement.style.zIndex = '9999';

    this.showSpeechBubble(targetX, targetY, elemW, elemH, vpW, vpH, minY);
  }

  showSpeechBubble(x, y, w, h, vpW, vpH, minY) {
    if (!this.speechBubble) return;

    let quipIndex = (this.evasionCount - 1) % this.quips.length;
    let text = this.quips[quipIndex];

    if (this.evasionCount >= 5 && this.evasionCount % 3 === 0) {
      text = `Né ${this.evasionCount} lần rồi đó! Bấm nút kia đi haha! 🏆`;
    }

    this.speechBubble.textContent = text;
    this.speechBubble.classList.remove('hidden', 'fade-out');
    this.speechBubble.classList.add('pop-in');

    const bubbleEstimateW = Math.min(220, vpW - 32);
    let bubbleX = Math.round(Math.max(16, Math.min(vpW - bubbleEstimateW - 16, x + (w / 2) - (bubbleEstimateW / 2))));
    
    let bubbleY = y - 44;
    if (bubbleY < 75) {
      bubbleY = y + h + 10;
    }
    if (bubbleY > vpH - 50) {
      bubbleY = vpH - 50;
    }

    this.speechBubble.style.left = `${bubbleX}px`;
    this.speechBubble.style.top = `${bubbleY}px`;

    clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => {
      if (this.speechBubble) {
        this.speechBubble.classList.add('fade-out');
      }
    }, 1200);
  }
}

const evasionEngine = new EvasionEngine();
