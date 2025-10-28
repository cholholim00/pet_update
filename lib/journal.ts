import { JournalEntry, Rewards } from '../store/types';

export function getToday(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

export function computeJournalRewards(entry: JournalEntry, prev: JournalEntry|undefined, streakDays: number): Rewards {
  let xp = 15; // base
  const len = entry.textLen;
  if(len>=150 && len<300) xp+=5; else if(len<600) xp+=10; else xp+=12; // cap
  const has = (k:string)=> entry.prompts.includes(k);
  xp += (has('gratitude')?3:0) + (has('reflect')?3:0) + (has('plan')?3:0);
  if(prev){
    const calmDelta = (entry.mood - prev.mood)/100;
    const negDelta = (prev.sentiment.neg - entry.sentiment.neg);
    if(calmDelta>0.05 || negDelta>0.05) xp += 5;
  }
  if(streakDays>=30) xp+=20; else if(streakDays>=14) xp+=12; else if(streakDays>=7) xp+=8; else if(streakDays>=3) xp+=4;
  xp = Math.min(50,xp);
  const currency = { seed: Math.min(20, Math.round(xp/3)) };
  return { xp, currency };
}

export function calcStreak(today: string, dates: string[]): number{
  const set = new Set(dates);
  let streak = 0;
  let d = new Date(today);
  while(set.has(d.toISOString().slice(0,10))){
    streak++; d.setDate(d.getDate()-1);
  }
  return streak;
}
