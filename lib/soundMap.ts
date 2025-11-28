// lib/soundMap.ts
import type { EmotionKey } from './emotionData';

// 지금은 BGM 파일이 없으니까, 전부 비워둔다.
// 나중에 mp3 준비되면 여기다가 require(...) 추가하면 됨.
export const EmotionBgm: Partial<Record<EmotionKey, any>> = {};
