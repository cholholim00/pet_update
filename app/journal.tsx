import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { usePetStore } from '../store/usePet';
import { computeJournalRewards, getToday, calcStreak } from '../lib/journal';
import { saveJournalEntry, loadDates } from '../lib/storage';

const PROMPTS = ['gratitude','reflect','plan','free'] as const;
type PromptKey = typeof PROMPTS[number];

export default function Journal(){
  const router = useRouter();
  const { lastEntry, mood, setMood, setLastEntry, applyRewards, dates, setDates } = usePetStore();
  const [text, setText] = useState('');
  const [sel, setSel] = useState<PromptKey[]>(['gratitude','plan']);

  const today = useMemo(()=>getToday(),[]);
  const textLen = text.trim().length;

  const toggle = (k:PromptKey)=> setSel(s=> s.includes(k)? s.filter(x=>x!==k) : [...s, k]);

  const onSubmit = async ()=>{
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

    await saveJournalEntry(entry);
    const newDates = Array.from(new Set([...(dates||[]), today]));
    setDates(newDates);
    setLastEntry(entry);
    applyRewards(rewards);
    router.push({ pathname:'/result', params: { xp: String(rewards.xp) } });
  };

  useEffect(()=>{ (async()=>{ const ds = await loadDates(); if(ds) setDates(ds); })(); },[]);

  return (
    <ScrollView contentContainerStyle={{ padding:20, gap:16 }}>
      <Text style={{ fontSize:22, fontWeight:'700' }}>하루 일기</Text>

      <View style={{ gap:8 }}>
        <Text>오늘 기분(0~100): {mood}</Text>
        <View style={{ flexDirection:'row', gap:8 }}>
          {[0,25,50,75,100].map(v=>
            <Pressable key={v} onPress={()=>setMood(v)} style={{ padding:10, borderWidth:1, borderRadius:8 }}>
              <Text>{v}</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
        {PROMPTS.map(p=>
          <Pressable key={p} onPress={()=>toggle(p)} style={{ paddingVertical:8, paddingHorizontal:12, borderWidth:1, borderRadius:16, backgroundColor: sel.includes(p)? '#222': '#fff' }}>
            <Text style={{ color: sel.includes(p)? '#fff':'#000' }}>{p}</Text>
          </Pressable>
        )}
      </View>

      <View style={{ borderWidth:1, borderRadius:12, padding:12, minHeight:160 }}>
        <TextInput
          placeholder="오늘 하루를 편하게 적어봐요..."
          multiline
          value={text}
          onChangeText={setText}
          style={{ minHeight:140 }}
        />
        <Text style={{ textAlign:'right' }}>{textLen}자</Text>
      </View>

      <Pressable onPress={onSubmit} style={{ backgroundColor:'black', padding:16, borderRadius:12 }}>
        <Text style={{ color:'white', textAlign:'center', fontWeight:'700' }}>제출하고 펫 성장 받기</Text>
      </Pressable>
    </ScrollView>
  );
}
