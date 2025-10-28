import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { usePetStore } from '../store/usePet';

export default function Root() {
  const rehydrate = usePetStore(s=>s.rehydrate);
  useEffect(()=>{ rehydrate(); }, [rehydrate]); // ✅ 앱 시작 시 저장값 복구
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="journal" />
      <Stack.Screen name="result" />
      <Stack.Screen name="history" />
      <Stack.Screen name="heatmap" />
      <Stack.Screen name="journalDetail" />
    </Stack>
  );
}
