import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';

type Row = { date: string; len: number; mood: number; xp: number };

export default function History() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('journal_dates');
      const dates: string[] = raw ? JSON.parse(raw) : [];
      const out: Row[] = [];
      for (const d of dates.sort().reverse()) {
        const eRaw = await AsyncStorage.getItem(`journal_${d}`);
        if (!eRaw) continue;
        const e = JSON.parse(eRaw);
        out.push({ date: d, len: e.textLen ?? 0, mood: e.mood ?? 0, xp: e.rewards?.xp ?? 0 });
      }
      setRows(out);
    })();
  }, []);

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:'700', marginBottom:8 }}>지난 일기</Text>
      <FlatList
        data={rows}
        keyExtractor={(it) => it.date}
        ItemSeparatorComponent={() => <View style={{ height:8 }} />}
        renderItem={({ item }) => (
          <Link href={{ pathname:'/journalDetail', params:{ date: item.date } }} asChild>
          <Pressable style={{ borderWidth:1, borderRadius:12, padding:12 }}>
            <Text style={{ fontWeight:'700' }}>{item.date}</Text>
            <Text>글자수 {item.len} · 기분 {item.mood} · XP +{item.xp}</Text>
          </Pressable>
          </Link>
        )}
        ListEmptyComponent={<Text>아직 기록이 없어요.</Text>}
      />
    </View>
  );
}
