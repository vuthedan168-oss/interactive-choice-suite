/**
 * Data presets and configuration models for Interactive Choice Suite
 */

const DEFAULT_CELEBRITIES = [
  {
    id: "celeb-1",
    name: "Sơn Tùng M-TP",
    field: "Ca sĩ / Chủ tịch M-TP Ent",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
    initials: "ST",
    color: "from-amber-500 to-red-600"
  },
  {
    id: "celeb-2",
    name: "Cristiano Ronaldo",
    field: "Huyền thoại bóng đá thế giới (CR7)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
    initials: "CR7",
    color: "from-red-600 to-emerald-600"
  },
  {
    id: "celeb-3",
    name: "Lionel Messi",
    field: "Huyền thoại bóng đá đương đại (M10)",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
    initials: "LM10",
    color: "from-sky-500 to-blue-700"
  },
  {
    id: "celeb-4",
    name: "Blackpink Lisa",
    field: "Idol / Biểu tượng văn hoá quốc tế",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80",
    initials: "LS",
    color: "from-pink-500 to-purple-600"
  },
  {
    id: "celeb-5",
    name: "Taylor Swift",
    field: "Biểu tượng âm nhạc toàn cầu",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
    initials: "TS",
    color: "from-amber-400 to-pink-600"
  },
  {
    id: "celeb-6",
    name: "Trấn Thành",
    field: "MC / Đạo diễn điện ảnh tỷ đô",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=500&q=80",
    initials: "TT",
    color: "from-violet-600 to-indigo-700"
  },
  {
    id: "celeb-7",
    name: "HIEUTHUHAI",
    field: "Rapper / Ngôi sao thế hệ mới",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=80",
    initials: "H2",
    color: "from-cyan-500 to-blue-600"
  },
  {
    id: "celeb-8",
    name: "Mỹ Tâm",
    field: "Ca sĩ quốc dân / Họa mi tóc nâu",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80",
    initials: "MT",
    color: "from-rose-500 to-amber-600"
  },
  {
    id: "celeb-9",
    name: "Faker (Lee Sang-hyeok)",
    field: "Quỷ vương bất tử Esports T1",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
    initials: "FK",
    color: "from-red-600 to-rose-700"
  },
  {
    id: "celeb-10",
    name: "Tom Cruise",
    field: "Siêu sao điện ảnh hành động Hollywood",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=500&q=80",
    initials: "TC",
    color: "from-amber-600 to-neutral-700"
  },
  {
    id: "celeb-11",
    name: "Zendaya",
    field: "Diễn viên / Nữ hoàng thảm đỏ",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80",
    initials: "ZD",
    color: "from-fuchsia-600 to-purple-800"
  },
  {
    id: "celeb-12",
    name: "Leonardo DiCaprio",
    field: "Tài tử điện ảnh giải Oscar",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80",
    initials: "LD",
    color: "from-emerald-600 to-teal-800"
  },
  {
    id: "celeb-13",
    name: "Độ Mixi",
    field: "Streamer / Tộc trưởng Bộ tộc Mixi",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=500&q=80",
    initials: "DM",
    color: "from-orange-500 to-red-700"
  },
  {
    id: "celeb-14",
    name: "Elon Musk",
    field: "Doanh nhân công nghệ / CEO SpaceX",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=500&q=80",
    initials: "EM",
    color: "from-zinc-600 to-slate-900"
  },
  {
    id: "celeb-15",
    name: "IU (Lee Ji-eun)",
    field: "Em gái quốc dân / Ca sĩ - Diễn viên",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=500&q=80",
    initials: "IU",
    color: "from-pink-400 to-rose-500"
  },
  {
    id: "celeb-16",
    name: "MONO",
    field: "Nghệ sĩ trẻ / Ca sĩ Gen Z",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=500&q=80",
    initials: "MO",
    color: "from-purple-500 to-indigo-600"
  }
];

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

const THEMES = {
  love: {
    id: "love",
    name: "Tình yêu lãng mạn",
    icon: "heart",
    bodyClass: "theme-love",
    bgGradient: "from-rose-950 via-purple-950 to-slate-950",
    accentGlow: "rgba(244, 63, 94, 0.4)",
    targetBtnClass: "bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white shadow-rose-500/50 hover:shadow-rose-400/80",
    rejectBtnClass: "bg-white/10 hover:bg-white/20 text-rose-200 border border-rose-400/30",
    cardBorder: "border-rose-500/30",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30"
  },
  friendship: {
    id: "friendship",
    name: "Tình bạn thân thiết",
    icon: "users",
    bodyClass: "theme-friendship",
    bgGradient: "from-amber-950 via-orange-950 to-stone-950",
    accentGlow: "rgba(245, 158, 11, 0.4)",
    targetBtnClass: "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/50 hover:shadow-amber-400/80",
    rejectBtnClass: "bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-400/30",
    cardBorder: "border-amber-500/30",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
  },
  fun: {
    id: "fun",
    name: "Hài hước / Troll",
    icon: "sparkles",
    bodyClass: "theme-fun",
    bgGradient: "from-teal-950 via-cyan-950 to-slate-950",
    accentGlow: "rgba(20, 184, 166, 0.4)",
    targetBtnClass: "bg-gradient-to-r from-teal-400 via-emerald-500 to-cyan-500 text-slate-950 font-bold shadow-teal-500/50 hover:shadow-teal-400/80",
    rejectBtnClass: "bg-white/10 hover:bg-white/20 text-teal-200 border border-teal-400/30",
    cardBorder: "border-teal-500/30",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30"
  },
  luxury: {
    id: "luxury",
    name: "Thảm đỏ quý tộc",
    icon: "crown",
    bodyClass: "theme-luxury",
    bgGradient: "from-slate-950 via-zinc-950 to-neutral-950",
    accentGlow: "rgba(234, 179, 8, 0.3)",
    targetBtnClass: "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-950 font-bold shadow-amber-500/50 hover:shadow-yellow-300/80",
    rejectBtnClass: "bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-500/30",
    cardBorder: "border-amber-400/40",
    badgeColor: "bg-amber-400/20 text-amber-300 border-amber-400/40"
  }
};

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

const DEFAULT_MODE2_CONFIG = {
  title: "ĐẤU TRƯỜNG THẢM ĐỎ: VUA GIỮ ĐÀI",
  subtitle: "Ai là nhân vật xứng đáng đăng quang ngôi vị quán quân tối thượng?",
  roster: [...DEFAULT_CELEBRITIES],
  riggedWinnerId: "", // ID of candidate who is forced to win
  riggedFinalBoss: true, // if true, rigged candidate enters at the final championship duel
  customRiggedName: "Tôi (Người tạo thử thách)",
  customRiggedField: "Nhân vật bí ẩn bất khả chiến bại",
  customRiggedAvatar: ""
};

/**
 * URL State Serialization
 */
function serializeConfig(type, config) {
  try {
    const raw = JSON.stringify({ type, config, v: 1 });
    // Encode unicode safely in base64
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
    const decoder = new TextDecoder('utf-8');
    const jsonStr = decodeURIComponent(escape(binary));
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to deserialize config", e);
    return null;
  }
}
