/**
 * Data presets and configuration models for Love Choice Suite
 */

const THEMES = {
  love: {
    id: "love",
    name: "Tình yêu lãng mạn",
    desc: "Tông hồng ngọt ngào + Trái tim bay lơ lửng",
    icon: "heart",
    bodyClass: "theme-love",
    swatches: ["#f43f5e", "#ec4899", "#fda4af"],
    decorations: ["❤️", "💖", "💕", "💗", "🥰", "💓"],
    bgGradient: "from-rose-950 via-pink-950 to-slate-950",
    cardBg: "bg-slate-950/80 backdrop-blur-xl",
    cardBorder: "border-pink-500/40 shadow-pink-500/20",
    badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    targetBtnClass: "bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-xl shadow-pink-500/50 hover:shadow-pink-400/80",
    rejectBtnClass: "bg-pink-500/10 hover:bg-pink-500/20 text-pink-200 border border-pink-400/40"
  },
  friendship: {
    id: "friendship",
    name: "Tình bạn thân thiết",
    desc: "Tông cam hổ phách + Ngôi sao tỏa sáng",
    icon: "users",
    bodyClass: "theme-friendship",
    swatches: ["#f59e0b", "#fbbf24", "#fed7aa"],
    decorations: ["✨", "⭐", "🌟", "💫", "☀️", "💛"],
    bgGradient: "from-amber-950 via-orange-950 to-stone-950",
    cardBg: "bg-stone-950/80 backdrop-blur-xl",
    cardBorder: "border-amber-500/40 shadow-amber-500/20",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    targetBtnClass: "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-xl shadow-amber-500/50 hover:shadow-amber-400/80",
    rejectBtnClass: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-400/40"
  },
  fun: {
    id: "fun",
    name: "Hài hước / Meme Troll",
    desc: "Tông xanh Neon + Biểu tượng cười hài hước",
    icon: "sparkles",
    bodyClass: "theme-fun",
    swatches: ["#14b8a6", "#10b981", "#67e8f9"],
    decorations: ["😜", "🤣", "⚡", "🎉", "🔥", "🚀"],
    bgGradient: "from-teal-950 via-emerald-950 to-slate-950",
    cardBg: "bg-slate-950/80 backdrop-blur-xl",
    cardBorder: "border-teal-400/40 shadow-teal-500/20",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    targetBtnClass: "bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 text-slate-950 font-black shadow-xl shadow-teal-500/50 hover:shadow-teal-300/80",
    rejectBtnClass: "bg-teal-500/10 hover:bg-teal-500/20 text-teal-200 border border-teal-400/40"
  },
  luxury: {
    id: "luxury",
    name: "Thảm đỏ quý tộc",
    desc: "Tông đen nhung vàng kim + Bụi sao hoàng gia",
    icon: "crown",
    bodyClass: "theme-luxury",
    swatches: ["#eab308", "#facc15", "#fef08a"],
    decorations: ["👑", "✨", "💎", "🏆", "🌟", "💫"],
    bgGradient: "from-slate-950 via-neutral-950 to-zinc-950",
    cardBg: "bg-neutral-950/85 backdrop-blur-xl",
    cardBorder: "border-amber-400/50 shadow-amber-500/30",
    badgeColor: "bg-amber-400/20 text-amber-300 border-amber-400/40",
    targetBtnClass: "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-xl shadow-amber-500/50 hover:shadow-yellow-300/80",
    rejectBtnClass: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-400/40"
  }
};

const CURATED_GIFS = [
  {
    id: "gif-love-cat",
    title: "Mèo con ôm ấp ngọt ngào",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWppbmF5b3dwY25kczBqbHN4ZGltcG8zdWZ0d3VveWpnYnludGg4biZlcD12MV9naWZzX3NlYXJjaCZjdD1n/MDJ9IbxxvDUQM/giphy.gif",
    tag: "Tình yêu"
  },
  {
    id: "gif-happy-dance",
    title: "Gấu trúc nhảy ăn mừng",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNG11a3d0dWZmb2pibHB0dTVsd3Vva3F1NWszaWlqdzZ2bnprMnAzZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/artj92V8o75VPL7AeQ/giphy.gif",
    tag: "Hài hước"
  },
  {
    id: "gif-boba-bear",
    title: "Bé gấu thả tim siêu cute",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGszcGg1aGN2amVycTR2cHNvMmcxbGVyYWlsdjY3anQ5aXR2cW43NSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/M90mJvfWfd5mbUuULX/giphy.gif",
    tag: "Tình yêu"
  },
  {
    id: "gif-dog-party",
    title: "Cún cưng tung hoa tiệc tùng",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3k1ZTNubHRxYXVra2R4M29mdTZqNHF3NnBvMWk2ZXJ2bHNudjR3ayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/blSTtZehjAZ8I/giphy.gif",
    tag: "Bạn bè"
  },
  {
    id: "gif-cat-yes",
    title: "Mèo đồng ý lia lịa",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGVpczB4NXl0b2drNjVyNDNwbnd2N2FkMHVrbnI3b3Z5b2w3d2lyMyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ICOgUNjpvO0PC/giphy.gif",
    tag: "Hài hước"
  },
  {
    id: "gif-heart-explosion",
    title: "Bắn tim ngập tràn màn hình",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmtuYnl1Z2k3dnBnOTdhNndsc3FjY2s4cmFpdWlscWZlMHN6dTZ6cCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/R6gVNROjGPzUM/giphy.gif",
    tag: "Tình yêu"
  }
];

const DEFAULT_RUNAWAY_QUIPS = [
  "Ủa tính bấm hả? Đố bắt được nè! 😜",
  "Hụt rồi nha bạn ơi! 🏃‍♂️💨",
  "Nút này bị cấm rồi nha! ❌",
  "Bấm nút bên kia kìa, đừng cố chấp! 👉",
  "Né đòn 100%! Lêu lêu! 😝",
  "Không bao giờ bấm trúng đâu haha! ✨",
  "Tớ bay qua đây rồi nè! 🚀",
  "Đừng đuổi theo tớ vô ích! 😆"
];

const DEFAULT_MODE1_CONFIG = {
  question: "Cậu có yêu tớ không? ❤️",
  subtitle: "Hãy suy nghĩ thật kỹ trước khi đưa ra câu trả lời nhé!",
  targetText: "Có ơi là có 💕",
  rejectText: "Không bao giờ 😒",
  theme: "love",
  celebrationTitle: "Yay! Tớ biết mà! Cảm ơn cậu nhiều nha! 🎉",
  celebrationMessage: "Từ nay cậu chính thức là người quan trọng nhất trong lòng tớ đó! Hứa là sẽ luôn làm cậu cười mỗi ngày! 🥰",
  celebrationGif: CURATED_GIFS[0].url
};

/**
 * URL State Serialization
 */
function serializeConfig(type, config) {
  try {
    const raw = JSON.stringify({ type, config, v: 2 });
    const utf8 = encodeURIComponent(raw).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode('0x' + p1);
    });
    return btoa(utf8);
  } catch (e) {
    console.error("Failed to serialize config", e);
    return null;
  }
}

function deserializeConfig(hashOrQuery) {
  try {
    if (!hashOrQuery) return null;
    let clean = hashOrQuery.replace(/^(\?|#)/, '');
    const params = new URLSearchParams(clean);
    const payload = params.get('data') || params.get('cfg') || clean;
    if (!payload) return null;
    
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = decodeURIComponent(escape(binary));
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to deserialize config", e);
    return null;
  }
}
