// store/types.ts

export type PetMood = 'calm' | 'happy' | 'sleepy' | 'excited';

export interface Pet {
  id: string;
  name: string;
  level: number; // 1..20
  xp: number;    // 0..99 (100되면 레벨업)
  bond: number;  // 0..5
  mood: PetMood;
}

export interface Rewards {
  xp: number;                    // 부여 XP
  currency?: Record<string, number>;
}

export interface JournalEntry {
  id: string;
  uid: string;
  date: string; // YYYY-MM-DD
  mood: number; // 0..100
  prompts: string[];
  textLen: number;
  text?: string;
  keywords: string[];
  sentiment: { pos:number; neg:number; energy:number };
  rewards: Rewards;
  createdAt: number;
}
