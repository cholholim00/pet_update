import { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteJournalEntry } from '../lib/storage';
import { usePetStore } from '../store/usePet';

export default function JournalDetail(){
  const { date } = useLocalSearchParams<{ date: string }>();
  const [entry, setEntry] = useState<any>(null);
  const router = useRouter();
  const { setDates, dates } = usePetStore();

  useEffect(()=>{
    (async ()=>{
      const raw = await AsyncStorage.getItem(`journal_${date}`);
      setEntry(raw? JSON.parse(raw) : null);
    })();
  }, [date]);

  const onDelete = async ()=>{
    Alert.alert('삭제', `${date} 일기를 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: async ()=>{
          await deleteJournalEntry(date!);
          const newDates = (dates||[]).filter(d=>d!==date);
          setDates(newDates);         // streak 갱신
          router.back();
        } 
      },
    ]);
  };

  if(!entry) return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:16 }}>
      <Text>기록을 찾을 수 없어요.</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
      <Text style={{ fontSize:20, fontWeight:'700' }}>{entry.date}</Text>
      <Text>기분: {entry.mood}</Text>
      <Text>프롬프트: {entry.prompts?.join(', ')}</Text>
      <Text>획득 XP: {entry.rewards?.xp ?? 0}</Text>
      <View style={{ borderWidth:1, borderRadius:12, padding:12 }}>
        <Text style={{ fontWeight:'700', marginBottom:6 }}>본문</Text>
        <Text>{entry.text || '(내용 없음)'}</Text>
      </View>

      <Pressable onPress={onDelete} style={{ backgroundColor:'#ef4444', padding:12, borderRadius:10 }}>
        <Text style={{ color:'#fff', textAlign:'center', fontWeight:'700' }}>이 일기 삭제</Text>
      </Pressable>
    </ScrollView>
  );
}
