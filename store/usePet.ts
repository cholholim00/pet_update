// store/usePet.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Pet, Rewards, JournalEntry } from './types';

const PET_KEY = 'pet';
const DATES_KEY = 'journal_dates';
const LAST_ENTRY_KEY = 'last_entry';
const BGM_KEY = 'bgm_enabled';

const initialPet: Pet = {
  id: 'p1',
  name: '루미',
  level: 1,
  xp: 0,
  bond: 0,
  mood: 'calm',
};

type PetState = {
  // core states
  pet: Pet;                    // 항상 존재하도록 보장
  mood: number;                // 일기 작성용 0..100
  dates: string[];             // 'YYYY-MM-DD' 목록
  streak: number;              // 현재 연속일수
  lastEntry?: JournalEntry;
  justLeveled: boolean;

  // bgm
  bgmEnabled: boolean;
  toggleBgm: () => void;
  setBgmEnabled: (v: boolean) => void;

  // selectors
  petXp: () => number;
  petLevel: () => number;

  // actions
  setMood: (n: number) => void;
  setDates: (d: string[]) => void;
  setLastEntry: (e: JournalEntry) => void;
  applyRewards: (r: Rewards) => void;
  ackLevelUp: () => void;
  rehydrate: () => Promise<void>;
};

export const usePetStore = create<PetState>((set, get) => ({
  // ── base
  pet: initialPet,
  mood: 50,
  dates: [],
  streak: 0,
  lastEntry: undefined,
  justLeveled: false,

  // ── bgm
  bgmEnabled: true,
  setBgmEnabled: (v) => {
    set({ bgmEnabled: v });
    AsyncStorage.setItem(BGM_KEY, JSON.stringify(v)).catch(() => {});
  },
  toggleBgm: () => {
    const next = !get().bgmEnabled;
    set({ bgmEnabled: next });
    AsyncStorage.setItem(BGM_KEY, JSON.stringify(next)).catch(() => {});
  },

  // ── selectors
  petXp: () => get().pet.xp,
  petLevel: () => get().pet.level,

  // ── actions
  setMood: (n) => set({ mood: Math.max(0, Math.min(100, n)) }),

  setDates: (d) =>
    set({
      dates: d,
      streak: calcStreakFromDates(d),
    }),

  setLastEntry: (e) => {
    set({ lastEntry: e });
    AsyncStorage.setItem(LAST_ENTRY_KEY, JSON.stringify(e)).catch(() => {});
  },

  applyRewards: (r) =>
    set((s) => {
      const addXp = Math.max(0, r?.xp ?? 0);
      let { xp, level, bond } = s.pet;

      const beforeLevel = level;
      xp += addXp;
      while (xp >= 100 && level < 20) {
        xp -= 100;
        level += 1;
      }
      bond = Math.min(5, bond + (addXp >= 30 ? 1 : 0));

      const nextPet = { ...s.pet, xp, level, bond };
      AsyncStorage.setItem(PET_KEY, JSON.stringify(nextPet)).catch(() => {});

      return {
        pet: nextPet,
        justLeveled: level > beforeLevel,
      };
    }),

  ackLevelUp: () => set({ justLeveled: false }),

  rehydrate: async () => {
    try {
      const [pRaw, dRaw, lRaw, bRaw] = await Promise.all([
        AsyncStorage.getItem(PET_KEY),
        AsyncStorage.getItem(DATES_KEY),
        AsyncStorage.getItem(LAST_ENTRY_KEY),
        AsyncStorage.getItem(BGM_KEY),
      ]);

      if (pRaw) set({ pet: JSON.parse(pRaw) as Pet });

      if (dRaw) {
        const dates = JSON.parse(dRaw) as string[];
        set({ dates, streak: calcStreakFromDates(dates) });
      }

      if (lRaw) set({ lastEntry: JSON.parse(lRaw) as JournalEntry });

      if (bRaw !== null) set({ bgmEnabled: JSON.parse(bRaw) as boolean });
    } catch {
      // ignore
    }
  },
}));

function calcStreakFromDates(dates: string[]): number {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const set = new Set(dates);
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  let c = 0;
  while (set.has(iso(d))) {
    c += 1;
    d.setDate(d.getDate() - 1);
  }
  return c;
}
