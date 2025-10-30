import { useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeatmapCalendar from '../components/HeatmapCalendar';
import { useFocusEffect } from '@react-navigation/native'; // ✅ 포커스시 재로드

function toISO(d: Date) { return d.toISOString().slice(0,10); }
function xpToLevel(xp: number): 0|1|2|3|4 {
  if (!xp || xp <= 0) return 0;
  if (xp <= 15) return 1;
  if (xp <= 30) return 2;
  if (xp <= 40) return 3;
  return 4;
}
function calcCurrentStreak(dateSet: Set<string>): number {
  let streak = 0;
  const d = new Date(); d.setHours(0,0,0,0);
  while (dateSet.has(toISO(d))) { streak++; d.setDate(d.getDate()-1); }
  return streak;
}
function calcBestStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const set = new Set(dates);
  const xs = dates.map(s => new Date(s)).sort((a,b)=>a.getTime()-b.getTime());
  const start = xs[0], end = xs[xs.length-1];
  let best = 0, cur = 0;
  const it = new Date(start); it.setHours(0,0,0,0);
  const endDay = new Date(end); endDay.setHours(0,0,0,0);
  for (; it <= endDay; it.setDate(it.getDate()+1)) {
    const iso = toISO(it);
    if (set.has(iso)) { cur++; if (cur>best) best=cur; }
    else { cur=0; }
  }
  return best;
}

export default function HeatmapScreen(){
  const [levels, setLevels] = useState<Record<string, 0|1|2|3|4>>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const load = useCallback(async ()=>{
    const raw = await AsyncStorage.getItem('journal_dates');
    const dates: string[] = raw ? JSON.parse(raw) : [];
    const levelMap: Record<string, 0|1|2|3|4> = {};
    for (const d of dates) {
      const eRaw = await AsyncStorage.getItem(`journal_${d}`);
      if (!eRaw) { levelMap[d] = 0; continue; }
      const e = JSON.parse(eRaw);
      const xp = e?.rewards?.xp ?? 0;
      levelMap[d] = xpToLevel(xp);
    }
    setLevels(levelMap);
    const dateSet = new Set(dates);
    setCurrentStreak(calcCurrentStreak(dateSet));
    setBestStreak(calcBestStreak(dates));
  }, []);

  useFocusEffect(useCallback(()=>{ load(); }, [load]));

  return (
    <View style={{ flex:1, padding:16, paddingTop: 24 }}>
      <Text style={{ fontSize:20, fontWeight:'700', marginBottom:10 }}>연속 기록 히트맵</Text>
      <HeatmapCalendar
        levels={levels}
        weeks={12}
        startOnSunday={true}
        currentStreak={currentStreak}
        bestStreak={bestStreak}
      />
    </View>
  );
}
