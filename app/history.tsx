import { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, Modal, ScrollView, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { deleteJournalEntry } from '../lib/storage';
import { usePetStore } from '../store/usePet';

 // YYYY-MM-DD만 딱 쓰이게 정규화
  const norm = (d: string) => (d || '').slice(0, 10);

type Row = { date: string; len: number; mood: number; xp: number };
type Entry = any;

export default function History() {
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState<Entry | null>(null); // 선택된 항목 상세
  const router = useRouter();
  const { setDates } = usePetStore();

  const load = useCallback(async () => {
    const raw = await AsyncStorage.getItem('journal_dates');
    const dates: string[] = raw ? JSON.parse(raw) : [];
    const out: Row[] = [];
    for (const d of [...dates].sort().reverse()) {
      const eRaw = await AsyncStorage.getItem(`journal_${d}`);
      if (!eRaw) continue;
      const e = JSON.parse(eRaw);
      out.push({ date: d, len: e.textLen ?? 0, mood: e.mood ?? 0, xp: e.rewards?.xp ?? 0 });
    }
    setRows(out);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // 항목 탭 → 상세 모달 열기
const openDetail = useCallback(async (date: string) => {
  setLoading(true);
  const key = norm(date);
  const raw = await AsyncStorage.getItem(`journal_${key}`);
  setEntry(raw ? JSON.parse(raw) : null);
  setOpen(true);
  setLoading(false);
}, []);



// 삭제 실행(공통) 이미 있으니 그대로 두세요
const executeDelete = useCallback(async (key: string) => {
  const next = await deleteJournalEntry(key);
  setDates(next);
  setRows(prev => prev.filter(r => norm(r.date) !== key));
  setOpen(false);
  setEntry(null);
  load().catch(() => {});
}, [setDates, load]);

// ✅ 새로 추가: 플랫폼별 삭제 트리거
const onDelete = useCallback(() => {
  if (!entry?.date) return;
  const key = norm(entry.date);

  if (Platform.OS === 'web') {
    // 웹은 Alert 다중 버튼 콜백이 불안정 → 즉시 실행
    executeDelete(key);
    return;
  }

  // 네이티브는 확인창 후 진행
  Alert.alert('삭제', `${key} 일기를 삭제할까요?`, [
    { text: '취소', style: 'cancel' },
    { text: '삭제', style: 'destructive', onPress: () => executeDelete(key) }
  ]);
}, [entry, executeDelete]);




  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 8 }}>지난 일기</Text>

      <FlatList
        data={rows}
        keyExtractor={(it) => it.date}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openDetail(item.date)}
            style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
          >
            <Text style={{ fontWeight: '700' }}>{item.date}</Text>
            <Text>글자수 {item.len} · 기분 {item.mood} · XP +{item.xp}</Text>
            <Text style={{ color: '#6b7280', marginTop: 4 }}>탭하면 내용 보기</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text>아직 기록이 없어요.</Text>}
      />

      {/* 홈으로 돌아가기 */}
      <Pressable
        onPress={() => router.push('/')}
        style={{ marginTop: 24, backgroundColor: '#1e40af', paddingVertical: 12, borderRadius: 10 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>
          🏠 홈으로 돌아가기
        </Text>
      </Pressable>

      {/* 상세 모달 */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
          alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <View style={{ width: '100%', maxWidth: 520, backgroundColor: 'white', borderRadius: 14, overflow: 'hidden' }}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#e5e7eb' }}>
              <Text style={{ fontSize: 18, fontWeight: '700' }}>
                {loading ? '불러오는 중…' : (entry?.date ?? '기록 없음')}
              </Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, gap: 8, maxHeight: 420 }}>
              {entry ? (
                <>
                  <Text>기분: {entry.mood}</Text>
                  <Text>프롬프트: {entry.prompts?.join(', ') || '-'}</Text>
                  <Text>획득 XP: {entry.rewards?.xp ?? 0}</Text>
                  <View style={{ borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 6 }}>
                    <Text style={{ fontWeight: '700', marginBottom: 6 }}>나의 일기내용</Text>
                    <Text>{entry.text || '(내용 없음)'}</Text>
                  </View>
                </>
              ) : (
                <Text>기록을 찾을 수 없어요.</Text>
              )}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 8, padding: 12 }}>
              <Pressable
                onPress={() => setOpen(false)}
                style={{ flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb' }}
              >
                <Text style={{ textAlign: 'center', fontWeight: '700' }}>닫기</Text>
              </Pressable>

              <Pressable
                onPress={onDelete}
                style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#ef4444' }}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>이 일기 삭제</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
