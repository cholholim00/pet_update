// store/usePet.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Pet, Rewards, JournalEntry } from './types';
// (선택) Haptics
// import * as Haptics from 'expo-haptics';

interface PetState {
  pet: Pet | null;
  mood: number;
  lastEntry?: JournalEntry;
  dates: string[];
  streak: number;
  justLeveled: boolean;          // ✅ 추가
  setMood: (n:number)=>void;
  setDates: (d:string[])=>void;
  setLastEntry: (e:JournalEntry)=>void;
  applyRewards: (r:Rewards)=>void;
  ackLevelUp: ()=>void;          // ✅ 추가
   /** ✅ 앱 시작 시 저장된 pet/dates 복구 */
  rehydrate: ()=>Promise<void>;
}

const PET_KEY = 'pet';
const DATES_KEY = 'journal_dates';

export const usePetStore = create<PetState>((set,get)=>({
  pet: { id:'p1', name:'루미', level:1, xp:0, bond:0, mood:'calm' },
  mood: 50,
  dates: [],
  streak: 0,
  justLeveled: false,            // ✅ 초기값

  setMood: (n)=> set({ mood: n }),
  setDates: (d)=> set({ dates:d, streak: calcStreakLocal(d) }),
  setLastEntry: (e)=> set({ lastEntry: e }),
  ackLevelUp: ()=> set({ justLeveled: false }),  // ✅ 리셋

  applyRewards: (r)=> set(s=>{
    let pet = s.pet ?? { id:'p1', name:'루미', level:1, xp:0, bond:0, mood:'calm' };
    const beforeLevel = pet.level;               // ✅ 이전 레벨 보관
    let xp = pet.xp + (r?.xp ?? 0);
    let level = pet.level;
    while (xp >= 100 && level < 20) { xp -= 100; level += 1; }
    const bond = Math.min(5, pet.bond + ((r?.xp ?? 0) >= 30 ? 1 : 0));
    const newPet = { ...pet, xp, level, bond };
    const justLeveled = level > beforeLevel;     // ✅ 레벨업 감지
    // if (justLeveled) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(()=>{}); }
    AsyncStorage.setItem('pet', JSON.stringify(newPet)).catch(()=>{});
    return { pet: newPet, justLeveled };         // ✅ 플래그 반영
  }),

  rehydrate: async ()=>{
    try {
      const [praw, draw] = await Promise.all([
        AsyncStorage.getItem(PET_KEY),
        AsyncStorage.getItem(DATES_KEY),
      ]);
      if (praw) set({ pet: JSON.parse(praw) as Pet });
      if (draw) {
        const dates = JSON.parse(draw) as string[];
        set({ dates, streak: calcStreakLocal(dates) });
      }
    } catch {}
  },
}));

function calcStreakLocal(dates: string[]): number {
  const set = new Set(dates);
  let streak = 0;
  let d = new Date();
  const iso = (x:Date)=> x.toISOString().slice(0,10);
  while (set.has(iso(d))) { streak++; d.setDate(d.getDate()-1); }
  return streak;
}
