// lib/emotionData.ts
export type EmotionKey = 'sad' | 'tired' | 'calm' | 'happy';

export function getEmotionKey(mood: number): EmotionKey {
  if (mood < 30) return 'sad';
  if (mood < 50) return 'tired';
  if (mood < 75) return 'calm';
  return 'happy';
}

export const HealingMessages: Record<EmotionKey, string[]> = {
  sad: [
    '괜찮아, 오늘도 충분히 잘 버텼어 🌙',
    '힘든 날도 결국 지나가. 너는 이미 멋진 사람이야 💫',
    '지금 느끼는 슬픔도 너의 일부야, 다 괜찮아.',
  ],
  tired: [
    '오늘은 아무것도 안 해도 괜찮아 🍃',
    '그저 숨 쉬는 것만으로도 잘하고 있어 ☕',
    '잠시 쉬어가도 돼, 너는 충분히 노력했어.',
  ],
  calm: [
    '잔잔한 마음이 참 예뻐 🌊',
    '오늘 하루의 평온을 꼭 품어줘 🌤️',
    '마음의 파도는 곧 잔잔해질 거야.',
  ],
  happy: [
    '너의 행복이 세상에 스며들고 있어 ☀️',
    '지금 이 기분, 오래오래 간직하자 💛',
    '오늘의 너는 정말 반짝여 ✨',
  ],
};
