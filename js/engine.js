/**
 * Runaway Physics & Proximity Evasion Engine
 * Handles dodging physics for both the Mode 1 reject button and Mode 2 rigged rival card.
 */

class EvasionEngine {
  constructor() {
    this.activeElement = null;
    this.container = null;
    this.evasionCount = 0;
    this.quips = [...DEFAULT_RUNAWAY_QUIPS];
    this.boundListeners = [];
    this.isDodging = false;
    this.lastDodgeTime = 0;
    this.cooldownMs = 120;
    this.proximityRadius = 85;
    this.speechBubble = null;
  }

  attach(element, options = {}) {
    this.detach();
    if (!element) return;

    this.activeElement = element;
    this.container = options.container || document.body;
    this.evasionCount = 0;
    this.proximityRadius = options.proximityRadius || 85;
    if (options.quips) {
      this.quips = options.quips;
    }

    // Ensure element has absolute/fixed positioning
    this.activeElement.classList.add('runaway-target');
    this.createSpeechBubble();

    const onPointerMove = (e) => this.handlePointerMove(e);
    const onTouchStart = (e) => this.handleTouch(e);
    const onMouseEnter = (e) => this.dodge(e);

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    this.activeElement.addEventListener('mouseenter', onMouseEnter);
    this.activeElement.addEventListener('touchstart', onTouchStart, { passive: false });
    this.activeElement.addEventListener('click', (e) => {
      // Emergency failsafe: if somehow clicked, cancel click and dodge immediately!
      e.preventDefault();
      e.stopPropagation();
      this.dodge(e);
    });

    this.boundListeners = [
      { target: window, event: 'mousemove', fn: onPointerMove },
      { target: this.activeElement, event: 'mouseenter', fn: onMouseEnter },
      { target: this.activeElement, event: 'touchstart', fn: onTouchStart }
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
    if (e.touches && e.touches[0]) {
      this.dodge(e.touches[0]);
    } else {
      this.dodge(e);
    }
  }

  dodge(e = null) {
    if (!this.activeElement) return;
    const now = Date.now();
    if (now - this.lastDodgeTime < 100) return;
    this.lastDodgeTime = now;
    this.evasionCount++;

    sounds.playBoing();

    const rect = this.activeElement.getBoundingClientRect();
    const elemW = rect.width || 140;
    const elemH = rect.height || 48;

    // Viewport safe bounds
    const margin = 24;
    const topOffset = 80; // keep below header
    const maxW = window.innerWidth - elemW - margin;
    const maxH = window.innerHeight - elemH - margin;

    let targetX, targetY;

    if (e && e.clientX !== undefined && e.clientY !== undefined) {
      // Calculate flee vector opposite to cursor
      const cursorX = e.clientX;
      const cursorY = e.clientY;

      // Split screen into quadrants opposite from cursor
      let minX = margin;
      let maxX = maxW;
      let minY = topOffset;
      let maxY = maxH;

      if (cursorX > window.innerWidth / 2) {
        // Cursor on right, jump left
        maxX = Math.max(margin + 50, window.innerWidth * 0.45 - elemW);
      } else {
        // Cursor on left, jump right
        minX = Math.min(window.innerWidth * 0.55, maxW - 50);
      }

      if (cursorY > window.innerHeight / 2) {
        // Cursor on bottom, jump top
        maxY = Math.max(topOffset + 40, window.innerHeight * 0.45 - elemH);
      } else {
        // Cursor on top, jump bottom
        minY = Math.min(window.innerHeight * 0.55, maxH - 40);
      }

      targetX = Math.floor(minX + Math.random() * Math.max(20, maxX - minX));
      targetY = Math.floor(minY + Math.random() * Math.max(20, maxY - minY));
    } else {
      // Pure random fallback
      targetX = Math.floor(margin + Math.random() * (maxW - margin));
      targetY = Math.floor(topOffset + Math.random() * (maxH - topOffset));
    }

    // Clamp within viewport
    targetX = Math.max(margin, Math.min(maxW, targetX));
    targetY = Math.max(topOffset, Math.min(maxH, targetY));

    // Dynamic comical rotation
    const rotation = (Math.random() * 24 - 12).toFixed(1);
    const scale = (0.95 + Math.random() * 0.1).toFixed(2);

    // Lock current width so layout doesn't shrink when switching to fixed position
    if (!this.activeElement.style.width) {
      this.activeElement.style.width = `${elemW}px`;
    }

    this.activeElement.style.position = 'fixed';
    this.activeElement.style.left = `${targetX}px`;
    this.activeElement.style.top = `${targetY}px`;
    this.activeElement.style.transform = `rotate(${rotation}deg) scale(${scale})`;
    this.activeElement.style.zIndex = '9999';

    this.showSpeechBubble(targetX, targetY, elemW, elemH);
  }

  showSpeechBubble(x, y, w, h) {
    if (!this.speechBubble) return;

    let quipIndex = (this.evasionCount - 1) % this.quips.length;
    let text = this.quips[quipIndex];

    if (this.evasionCount >= 8 && this.evasionCount % 4 === 0) {
      text = `Né ${this.evasionCount} lần rồi đó! Nhận thua đi haha! 🏆`;
    }

    this.speechBubble.textContent = text;
    this.speechBubble.classList.remove('hidden', 'fade-out');
    this.speechBubble.classList.add('pop-in');

    // Position speech bubble above or below the button depending on screen position
    let bubbleY = y - 46;
    if (bubbleY < 75) {
      bubbleY = y + h + 12; // place below
    }
    let bubbleX = Math.max(16, Math.min(window.innerWidth - 220, x + (w / 2) - 100));

    this.speechBubble.style.left = `${bubbleX}px`;
    this.speechBubble.style.top = `${bubbleY}px`;

    // Auto-hide bubble after a brief moment
    clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => {
      if (this.speechBubble) {
        this.speechBubble.classList.add('fade-out');
      }
    }, 1400);
  }
}

const evasionEngine = new EvasionEngine();
