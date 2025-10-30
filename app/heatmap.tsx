// app/heatmap.tsx
import { useState, useCallback } from 'react';
import { View, Text, Modal, ScrollView, Pressable, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeatmapCalendar from '../components/HeatmapCalendar';
import { useFocusEffect } from '@react-navigation/native';
import { deleteJournalEntry } from '../lib/storage';
import { usePetStore } from '../store/usePet';

function toISO(d: Date) { return d.toISOString().slice(0,10); }
function xpToLevel(xp: number): 0|1|2|3|4 { if (!xp || xp <= 0) return 0; if (xp <= 15) return 1; if (xp <= 30) return 2; if (xp <= 40) return 3; return 4; }
const norm = (d: string) => (d || '').slice(0,10);

function calcCurrentStreak(dateSet: Set<string>): number {
  let streak = 0; const d = new Date(); d.setHours(0,0,0,0);
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
    if (set.has(iso)) { cur++; if (cur>best) best=cur; } else { cur=0; }
  }
  return best;
}

export default function HeatmapScreen(){
  const [levels, setLevels] = useState<Record<string, 0|1|2|3|4>>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // 모달 상태
  const [open, setOpen] = useState(false);
  const [entry, setEntry] = useState<any>(null);

  const { setDates } = usePetStore();

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

  // ✅ 셀 탭 → 상세 모달
  const openDetail = useCallback(async (iso: string) => {
    const key = norm(iso);
    const raw = await AsyncStorage.getItem(`journal_${key}`);
    setEntry(raw ? JSON.parse(raw) : null);
    setOpen(true);
  }, []);

  // ✅ 삭제 공통 실행
  const executeDelete = useCallback(async (key: string) => {
    const next = await deleteJournalEntry(key);
    setDates(next);
    // 히트맵 즉시 반영
    setLevels(prev => {
      const cp = { ...prev };
      delete cp[key];
      return cp;
    });
    setOpen(false);
    setEntry(null);
    load().catch(()=>{});
  }, [setDates, load]);

  // ✅ 삭제 트리거 (웹은 즉시, 네이티브는 확인 후)
  const onDelete = useCallback(() => {
    if (!entry?.date) return;
    const key = norm(entry.date);
    if (Platform.OS === 'web') { executeDelete(key); return; }
    Alert.alert('삭제', `${key} 일기를 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => executeDelete(key) }
    ]);
  }, [entry, executeDelete]);

  return (
    <View style={{ flex:1, padding:16, paddingTop: 24 }}>
      <Text style={{ fontSize:20, fontWeight:'700', marginBottom:10 }}>연속 기록 히트맵</Text>
      <HeatmapCalendar
        levels={levels}
        weeks={12}
        startOnSunday={true}
        currentStreak={currentStreak}
        bestStreak={bestStreak}
        onPressDate={openDetail}   // ✅ 탭 핸들러 전달
      />

      {/* 상세 모달 */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.35)', alignItems:'center', justifyContent:'center', padding:16 }}>
          <View style={{ width:'100%', maxWidth:520, backgroundColor:'white', borderRadius:14, overflow:'hidden' }}>
            <View style={{ padding:16, borderBottomWidth:1, borderColor:'#e5e7eb' }}>
              <Text style={{ fontSize:18, fontWeight:'700' }}>{entry?.date ?? '기록 없음'}</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding:16, gap:8, maxHeight:420 }}>
              {entry ? (
                <>
                  <Text>기분: {entry.mood}</Text>
                  <Text>프롬프트: {entry.prompts?.join(', ') || '-'}</Text>
                  <Text>획득 XP: {entry.rewards?.xp ?? 0}</Text>
                  <View style={{ borderWidth:1, borderRadius:10, padding:12, marginTop:6 }}>
                    <Text style={{ fontWeight:'700', marginBottom:6 }}>본문</Text>
                    <Text>{entry.text || '(내용 없음)'}</Text>
                  </View>
                </>
              ) : <Text>기록을 찾을 수 없어요.</Text>}
            </ScrollView>
            <View style={{ flexDirection:'row', gap:8, padding:12 }}>
              <Pressable onPress={() => setOpen(false)} style={{ flex:1, padding:12, borderRadius:10, borderWidth:1, borderColor:'#e5e7eb' }}>
                <Text style={{ textAlign:'center', fontWeight:'700' }}>닫기</Text>
              </Pressable>
              <Pressable onPress={onDelete} style={{ flex:1, padding:12, borderRadius:10, backgroundColor:'#ef4444' }}>
                <Text style={{ color:'#fff', textAlign:'center', fontWeight:'700' }}>이 일기 삭제</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
