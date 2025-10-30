import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { usePetStore } from '../store/usePet';
import { computeJournalRewards, getToday, calcStreak } from '../lib/journal';
import { saveJournalEntry, loadDates } from '../lib/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROMPTS = ['우울','위로','자유','기쁨','행복'] as const;
type PromptKey = typeof PROMPTS[number];
const MIN_LEN = 10; // 최소 글자수(원하면 조정)

export default function Journal(){
  const router = useRouter();
  const { lastEntry, mood, setMood, setLastEntry, applyRewards, dates, setDates } = usePetStore();
  const [text, setText] = useState('');
  const [sel, setSel] = useState<PromptKey[]>([]);
  const [saving, setSaving] = useState(false);
  const today = useMemo(()=>getToday(),[]);
  const textLen = text.trim().length;
  const submittedRef = useRef(false); // 중복 제출 방지

  const toggle = (k:PromptKey)=> setSel(s=> s.includes(k)? s.filter(x=>x!==k) : [...s, k]);

  const onSubmit = async ()=>{
    if (submittedRef.current || saving) return;
    if (textLen < MIN_LEN) {
      Alert.alert('조금만 더!', `최소 ${MIN_LEN}자 이상 적어주세요.`);
      return;
    }
    setSaving(true);
    submittedRef.current = true;

    try {
      // 이미 오늘 작성된 기록이 있는지 체크 → 수정 저장
      const existing = await AsyncStorage.getItem(`journal_${today}`);

      const prev = lastEntry;
      const entry: any = {
        id: `${today}`,
        uid: 'guest',
        date: today,
        mood,
        prompts: sel,
        textLen,
        text,
        keywords: [],
        sentiment: { pos: Math.min(1, mood/100 + 0.2), neg: Math.max(0, 1 - mood/100 - 0.2), energy: Math.min(1, 0.5 + mood/200) },
        rewards: { xp:0, currency:{} },
        createdAt: Date.now(),
      };

      const streak = calcStreak(today, dates);
      const rewards = computeJournalRewards(entry, prev as any, streak);
      entry.rewards = rewards;

      // 저장
      await saveJournalEntry(entry);

      // dates 업데이트(중복 방지)
      const newDates = Array.from(new Set([...(dates||[]), today]));
      setDates(newDates);

      // 펫/최근 기록 갱신
      setLastEntry(entry);
      applyRewards(rewards);

      // 결과 화면
      router.push({ pathname:'/result', params: { xp: String(rewards.xp), updated: existing ? '1' : '0' } });
    } catch (e) {
      Alert.alert('오류', '저장 중 문제가 발생했어요.');
    } finally {
      setSaving(false);
      submittedRef.current = false;
    }
  };

  useEffect(()=>{ (async()=>{ const ds = await loadDates(); if(ds) setDates(ds); })(); },[setDates]);

  const submitDisabled = saving || textLen < MIN_LEN;

  return (
    <ScrollView contentContainerStyle={{ padding:20, gap:16 }}>
      <Text style={{ fontSize:22, fontWeight:'700' }}>하루 일기</Text>

      <View style={{ gap:8 }}>
        <Text>오늘 기분(0~100): {mood}</Text>
        <View style={{ flexDirection:'row', gap:8 }}>
          {[0,25,50,75,100].map(v=>
            <Pressable key={v} onPress={()=>setMood(v)} style={{ padding:10, borderWidth:1, borderRadius:8, opacity: saving?0.5:1 }}>
              <Text>{v}</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
        {PROMPTS.map(p=>
          <Pressable
            key={p}
            onPress={()=>toggle(p)}
            disabled={saving}
            style={{
              paddingVertical:8, paddingHorizontal:12, borderWidth:1, borderRadius:16,
              backgroundColor: sel.includes(p)? '#222': '#fff', opacity: saving?0.6:1
            }}>
            <Text style={{ color: sel.includes(p)? '#fff':'#000' }}>{p}</Text>
          </Pressable>
        )}
      </View>

      <View style={{ borderWidth:1, borderRadius:12, padding:12, minHeight:160 }}>
        <TextInput
          placeholder="오늘 하루의 감정들을 편하게 적어봐요..."
          multiline
          value={text}
          onChangeText={setText}
          editable={!saving}
          style={{ minHeight:140 }}
        />
        <Text style={{ textAlign:'right' }}>{textLen}자</Text>
      </View>

      <Pressable
        onPress={onSubmit}
        disabled={submitDisabled}
        style={{ backgroundColor: submitDisabled ? '#999' : 'black', padding:16, borderRadius:12 }}
      >
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={{ color:'white', textAlign:'center', fontWeight:'700' }}>
              제출하고 펫 성장 받기 
            </Text>
        }
      </Pressable>
    </ScrollView>
  );
}