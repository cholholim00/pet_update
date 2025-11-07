// lib/emotionData.ts
export type EmotionKey =
  | 'sad' | 'lonely' | 'anxious' | 'stressed' | 'tired'
  | 'calm' | 'hopeful' | 'grateful' | 'happy' | 'excited';

// ✅ 감정별 기본 메시지
export const HealingMessages: Record<EmotionKey, string[]> = {
  sad: [
    '괜찮아, 오늘도 충분히 버텼어 🌙',
    '슬픔도 지나가. 너는 혼자가 아니야.',
  ],
  lonely: [
    '네가 느낀 외로움은 소중한 신호야.',
    '작은 연결도 마음을 데워줄 거야 ☕',
  ],
  anxious: [
    '호흡을 천천히—지금 여기만 보면 돼 🌬️',
    '불안은 예민함의 다른 이름이야. 넌 충분히 섬세해.',
  ],
  stressed: [
    '그만큼 노력했다는 증거야. 잠깐 멈춰도 좋아.',
    '완벽하진 않아도 충분히 잘하고 있어.',
  ],
  tired: [
    '오늘은 쉬어도 되는 날 🍃',
    '너의 페이스대로 가자. 천천히.',
  ],
  calm: [
    '잔잔함을 오래 품자 🌊',
    '고요는 힘이 돼.',
  ],
  hopeful: [
    '아주 작은 빛도 길이 돼 ✨',
    '내일의 너에게 기대가 생겼구나.',
  ],
  grateful: [
    '고마움을 느끼는 마음이 널 지켜줄 거야.',
    '오늘의 작은 선물들을 떠올려보자 🎁',
  ],
  happy: [
    '지금의 반짝임을 기억하자 ☀️',
    '행복이 너에게 잘 어울려!',
  ],
  excited: [
    '두근거림을 따라가자 💛',
    '새로운 시작이 기다리고 있어.',
  ],
};

// ✅ 감정 → 배경 이미지 (10장 전부)
export const EmotionBg: Record<EmotionKey, any> = {
  sad:       require('../assets/bg/bg_sad.png'),
  lonely:    require('../assets/bg/bg_lonely.png'),
  anxious:   require('../assets/bg/bg_anxious.png'),
  stressed:  require('../assets/bg/bg_stressed.png'),
  tired:     require('../assets/bg/bg_tired.png'),
  calm:      require('../assets/bg/bg_calm.png'),
  hopeful:   require('../assets/bg/bg_hopeful.png'),
  grateful:  require('../assets/bg/bg_grateful.png'),
  happy:     require('../assets/bg/bg_happy.png'),
  excited:   require('../assets/bg/bg_excited.png'),
};

// ✅ 감정 → 펫 Lottie (없는 감정은 근사치로 fallback)
export const EmotionPetAnim: Partial<Record<EmotionKey, any>> = {
  sad:       require('../assets/anim/pet_sad.json'),
  lonely:    require('../assets/anim/pet_sad.json'),
  anxious:   require('../assets/anim/pet_calm.json'),
  stressed:  require('../assets/anim/pet_tired.json'),
  tired:     require('../assets/anim/pet_tired.json'),
  calm:      require('../assets/anim/pet_calm.json'),
  hopeful:   require('../assets/anim/pet_happy.json'),
  grateful:  require('../assets/anim/pet_calm.json'),
  happy:     require('../assets/anim/pet_happy.json'),
  excited:   require('../assets/anim/pet_happy.json'),
};

// ✅ 규칙 기반 감정 분류
export function inferEmotion(mood: number, promptTags: string[] = []): EmotionKey {
  const t = promptTags.join(' ');
  const has = (k: string) => t.includes(k);

  // 키워드 우선
  if (has('외로') || has('lonely')) return 'lonely';
  if (has('불안') || has('anxiety') || has('걱정')) return 'anxious';
  if (has('스트레스') || has('압박') || has('burnout')) return 'stressed';
  if (has('감사') || has('고마움') || has('gratitude')) return 'grateful';
  if (has('설렘') || has('두근') || has('excite')) return 'excited';
  if (has('희망') || has('hope')) return 'hopeful';

  // mood 기반
  if (mood < 25) return 'sad';
  if (mood < 40) return 'tired';
  if (mood < 55) return 'stressed';
  if (mood < 70) return 'calm';
  if (mood < 85) return 'happy';
  return 'excited';
}
