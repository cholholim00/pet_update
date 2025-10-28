export type Currency = 'seed' | 'coral' | 'stardust';

export interface Pet {
  id: string;
  name: string;
  level: number; // 1..20
  xp: number;    // 0..100 → level up
  bond: number;  // 0..5
  mood: 'calm'|'curious'|'sleepy'|'excited'|'tense';
}

export interface Rewards {
  xp: number;
  currency: Partial<Record<Currency, number>>;
}

export interface JournalEntry {
  id: string;
  uid: string;
  date: string; // YYYY-MM-DD
  mood: number; // 0..100
  prompts: string[];
  textLen: number;
  text?: string;           // ✅ 본문 저장
  keywords: string[];
  sentiment: { pos:number; neg:number; energy:number };
  rewards: Rewards;
  createdAt: number;
}
