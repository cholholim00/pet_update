// ⬇️ 파일 맨 위 (다른 import들과 같이)
import { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, ScrollView, Platform, ToastAndroid } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteJournalEntry } from '../lib/storage';
import { usePetStore } from '../store/usePet';

// ⬇️ 플랫폼 안전 토스트 유틸 (웹/ios는 Alert로 대체)
const safeToast = (msg: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    Alert.alert('', msg);
  }
};

export default function JournalDetail(){
  const params = useLocalSearchParams<{ date?: string | string[] }>();
  const date = Array.isArray(params.date) ? params.date[0] : params.date;

  const [entry, setEntry] = useState<any>(null);
  const router = useRouter();
  const { setDates } = usePetStore();

  useEffect(()=>{
    (async ()=>{
      if(!date) return;
      const raw = await AsyncStorage.getItem(`journal_${date}`);
      setEntry(raw ? JSON.parse(raw) : null);
    })();
  }, [date]);

  const onDelete = async () => {
    if (!date) {
      Alert.alert('오류', '삭제할 날짜를 알 수 없습니다.');
      return;
    }
    safeToast(`삭제 시도: ${date}`);
    try {
      const next = await deleteJournalEntry(String(date));
      setDates(next);
      safeToast('삭제 완료');
      router.replace('/history');
    } catch (e) {
      Alert.alert('오류', '삭제 중 문제가 발생했어요.');
    }
  };

  if(!entry) return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:16 }}>
      <Text>기록을 찾을 수 없어요.</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
      {/* ...상세 UI... */}
      <Pressable onPress={onDelete} style={{ backgroundColor:'#ef4444', padding:12, borderRadius:10 }}>
        <Text style={{ color:'#fff', textAlign:'center', fontWeight:'700' }}>이 일기 삭제</Text>
      </Pressable>
    </ScrollView>
  );
}
