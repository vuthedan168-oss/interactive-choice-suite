/**
 * Data presets and configuration models for Choice Arena
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
    field: "Huyền thoại bóng đá đương đại (LM10)",
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
    field: "Diễn viên / Biểu tượng thảm đỏ",
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
  celebrationGif: CURATED_GIFS[0].url,
  musicUrl: ""
};

const DEFAULT_MODE2_CONFIG = {
  title: "ĐẠI CHIẾN NGÔI SAO",
  subtitle: "Sàn đấu 16 ngôi sao đỉnh cao - Tìm ra Quán quân số 1 trong lòng bạn!",
  roster: [...DEFAULT_CELEBRITIES],
  riggedWinnerId: "",
  riggedFinalBoss: true,
  customRiggedName: "Tôi (Người tạo thử thách)",
  customRiggedField: "Nhân vật bí ẩn bất khả chiến bại",
  customRiggedAvatar: "",
  musicUrl: ""
};

function computeInitials(name) {
  if (!name) return 'VIP';
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return words.map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

/**
 * Smart Avatar URL Resolver:
 * Automatically resolves YouTube channel links (@username), YouTube videos,
 * TikTok, Twitter/X, and GitHub usernames to direct high-resolution avatar URLs!
 */
function resolveAvatarUrl(url) {
  if (!url) return '';
  url = url.trim();

  // 1. YouTube Channel Handle: e.g. @captainofficial3180 or https://www.youtube.com/@captainofficial3180
  const ytChannelMatch = url.match(/(?:(?:https?:\/\/)?(?:www\.)?youtube\.com\/)?@([a-zA-Z0-9_\-\.]+)/i);
  if (ytChannelMatch && ytChannelMatch[1]) {
    return `https://unavatar.io/youtube/${ytChannelMatch[1]}`;
  }

  // 2. YouTube Custom Channel: /c/name or /user/name
  const ytCustomMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:c|user)\/([a-zA-Z0-9_\-\.]+)/i);
  if (ytCustomMatch && ytCustomMatch[1]) {
    return `https://unavatar.io/youtube/${ytCustomMatch[1]}`;
  }

  // 3. YouTube Video Thumbnail: e.g. https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
  const ytVideoMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/i);
  if (ytVideoMatch && ytVideoMatch[1]) {
    return `https://img.youtube.com/vi/${ytVideoMatch[1]}/hqdefault.jpg`;
  }

  // 4. TikTok: https://www.tiktok.com/@username or tiktok.com/@username
  const ttMatch = url.match(/(?:(?:https?:\/\/)?(?:www\.)?tiktok\.com\/)?@([a-zA-Z0-9_\-\.]+)/i);
  if (ttMatch && ttMatch[1] && !url.includes('youtube')) {
    return `https://unavatar.io/tiktok/${ttMatch[1]}`;
  }

  // 5. Twitter / X: https://x.com/username or https://twitter.com/username
  const twMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/i);
  if (twMatch && twMatch[1] && !['home', 'explore', 'notifications', 'messages'].includes(twMatch[1].toLowerCase())) {
    return `https://unavatar.io/twitter/${twMatch[1]}`;
  }

  // 6. GitHub: https://github.com/username
  const ghMatch = url.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-]+)/i);
  if (ghMatch && ghMatch[1] && !['settings', 'notifications', 'marketplace'].includes(ghMatch[1].toLowerCase())) {
    return `https://unavatar.io/github/${ghMatch[1]}`;
  }

  // 7. Direct image URL or fallback
  return url;
}

/**
 * URL State Serialization (Compact, Ultra-Short & URL-Safe)
 */
function serializeConfig(type, config) {
  try {
    let packed;
    if (type === 'mode1') {
      let cg = config.celebrationGif || '';
      const gifIdx = CURATED_GIFS.findIndex(g => g.url === cg);
      if (gifIdx !== -1) cg = gifIdx;

      packed = {
        v: 3,
        m: 'mode1',
        q: (config.question || '').trim(),
        s: (config.subtitle || '').trim(),
        yt: (config.targetText || '').trim(),
        rt: (config.rejectText || '').trim(),
        t: config.theme || 'love',
        ct: (config.celebrationTitle || '').trim(),
        cm: (config.celebrationMessage || '').trim(),
        cg: cg,
        mu: (config.musicUrl && !config.musicUrl.startsWith('data:audio') && !config.musicUrl.startsWith('blob:')) ? config.musicUrl.trim() : ''
      };
    } else {
      packed = {
        v: 3,
        m: 'mode2',
        t: (config.title || '').trim(),
        s: (config.subtitle || '').trim(),
        rw: config.riggedWinnerId || '',
        fb: config.riggedFinalBoss ? 1 : 0,
        mu: (config.musicUrl && !config.musicUrl.startsWith('data:audio') && !config.musicUrl.startsWith('blob:')) ? config.musicUrl.trim() : ''
      };

      // Only save roster if customized by user
      if (Array.isArray(config.roster)) {
        packed.r = config.roster.map(c => {
          const def = (typeof DEFAULT_CELEBRITIES !== 'undefined') ? DEFAULT_CELEBRITIES.find(d => d.id === c.id) : null;
          // If candidate is an unmodified default celebrity, store only the ID for ultra-compact URL
          if (def && def.name === c.name && def.field === c.field && def.avatar === c.avatar) {
            return { i: c.id };
          }
          const item = { i: c.id };
          if (!def || def.name !== c.name) item.n = (c.name || '').trim();
          if (!def || def.field !== c.field) item.f = (c.field || '').trim();
          if (!def || def.avatar !== c.avatar) {
            let av = (c.avatar || '').trim();
            // Cap base64 avatar so final URL fits spoo.me direct-redirect capacity
            if (av.startsWith('data:image/') && av.length > 9500) {
              av = '';
            }
            item.a = av;
          }
          return item;
        });
      }
    }

    const raw = JSON.stringify(packed);
    const bytes = (typeof TextEncoder !== 'undefined')
      ? new TextEncoder().encode(raw)
      : new Uint8Array(unescape(encodeURIComponent(raw)).split('').map(c => c.charCodeAt(0)));

    let bin = '';
    for (let i = 0; i < bytes.length; i++) {
      bin += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(bin);
    // Standard URL-Safe Base64: - instead of +, _ instead of /, strip trailing =
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.error("Failed to serialize config", e);
    return null;
  }
}

function deserializeConfig(input) {
  try {
    if (!input) return null;
    let clean = input.replace(/^(\?|#)/, '');
    const params = new URLSearchParams(clean);
    let payload = params.get('data') || params.get('cfg') || clean;

    if (payload.includes('data=')) {
      const p2 = new URLSearchParams(payload);
      payload = p2.get('data') || payload;
    }
    if (!payload) return null;

    // Restore URL-safe base64 and recover spaces caused by URL query parsing
    payload = payload.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '+');
    while (payload.length % 4 !== 0) {
      payload += '=';
    }

    const bin = atob(payload);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }

    let jsonStr;
    if (typeof TextDecoder !== 'undefined') {
      jsonStr = new TextDecoder('utf-8').decode(bytes);
    } else {
      jsonStr = decodeURIComponent(escape(bin));
    }

    const data = JSON.parse(jsonStr);

    // If version 3 (Compact schema)
    if (data && data.v === 3) {
      if (data.m === 'mode1' || (!data.m && data.q)) {
        let gifUrl = data.cg;
        if (typeof data.cg === 'number' && CURATED_GIFS[data.cg]) {
          gifUrl = CURATED_GIFS[data.cg].url;
        }
        return {
          type: 'mode1',
          config: {
            question: data.q || DEFAULT_MODE1_CONFIG.question,
            subtitle: data.s !== undefined ? data.s : DEFAULT_MODE1_CONFIG.subtitle,
            targetText: data.yt || DEFAULT_MODE1_CONFIG.targetText,
            rejectText: data.rt || DEFAULT_MODE1_CONFIG.rejectText,
            theme: data.t || DEFAULT_MODE1_CONFIG.theme,
            celebrationTitle: data.ct || DEFAULT_MODE1_CONFIG.celebrationTitle,
            celebrationMessage: data.cm || DEFAULT_MODE1_CONFIG.celebrationMessage,
            celebrationGif: gifUrl || DEFAULT_MODE1_CONFIG.celebrationGif,
            musicUrl: data.mu || ''
          }
        };
      } else if (data.m === 'mode2') {
        const parsedRoster = (data.r && Array.isArray(data.r)) ? data.r.map((c, idx) => {
          const def = (typeof DEFAULT_CELEBRITIES !== 'undefined') ? DEFAULT_CELEBRITIES.find(d => d.id === (c.i || c.id)) : null;
          const name = (c.n || (def ? def.name : null) || c.name || `Nhân vật #${idx + 1}`).trim();
          const field = (c.f || (def ? def.field : null) || c.field || 'Thần tượng nổi tiếng').trim();
          const avatar = c.a !== undefined ? c.a : (def ? def.avatar : (c.avatar || ''));
          const computedInitials = computeInitials(name);
          return {
            id: c.i || c.id || (def ? def.id : `celeb-${idx + 1}`),
            name: name,
            field: field,
            avatar: avatar,
            initials: c.in || c.initials || (def ? def.initials : computedInitials),
            color: c.c || c.color || (def ? def.color : 'from-amber-400 to-rose-600')
          };
        }) : JSON.parse(JSON.stringify(DEFAULT_CELEBRITIES));

        return {
          type: 'mode2',
          config: {
            title: data.t || DEFAULT_MODE2_CONFIG.title,
            subtitle: data.s !== undefined ? data.s : DEFAULT_MODE2_CONFIG.subtitle,
            riggedWinnerId: data.rw || '',
            riggedFinalBoss: data.fb !== 0,
            musicUrl: data.mu || '',
            roster: parsedRoster
          }
        };
      }
    }

    // Legacy v2 format support
    return data;
  } catch (e) {
    console.error("Failed to deserialize config", e);
    return null;
  }
}
