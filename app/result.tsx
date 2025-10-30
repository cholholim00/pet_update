// app/result.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePetStore } from '../store/usePet';
import LevelUpBurst from '../components/LevelUpBurst';

// ✅ 웹에서는 lottie-react-native 대신 텍스트 대체
let LottieView: any = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  LottieView = require('lottie-react-native').default;
}

export default function ResultScreen() {
 // 수정 ✅: selector로 필요한 값만, undefined 안전처리
const { xp } = useLocalSearchParams<{ xp?: string }>();
const router = useRouter();

// 🔧 수정된 부분 (밑줄 사라짐)
const petXp = usePetStore(state => state.pet?.xp ?? 0);
const petLevel = Math.floor(petXp / 100);
const gainXp = Number(xp ?? 0);
const [showLevelUp, setShowLevelUp] = useState(false);

// 레벨업 감지 useEffect
useEffect(() => {
  // 예: 레벨업 조건 (필요시 로직 조정)
  if (gainXp >= 10 && (petXp % 100) < 10) {
    setShowLevelUp(true);
    const t = setTimeout(() => setShowLevelUp(false), 3000);
    return () => clearTimeout(t);
  }
}, [gainXp, petXp]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 10 }}>🎉 오늘의 보상 🎉</Text>

      <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }}>
        {LottieView ? (
          <LottieView
            // ✅ 경로 수정: assets/anim
            source={require('../assets/animations/pet_growth.json')}
            autoPlay
            loop={false}
          />
        ) : (
          <Text style={{ fontSize: 18 }}>✨ 성장 애니(웹 대체)</Text>
        )}
      </View>

      <Text style={{ fontSize: 18, marginTop: 10 }}>+{xp} XP 획득!</Text>
      <Text style={{ color: '#6b7280', marginBottom: 16 }}>현재 레벨: Lv.{petLevel}</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable
          onPress={() => router.push('/')}
          style={{ backgroundColor: '#1e3a8a', padding: 12, borderRadius: 10, flex: 1 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>🏠 홈으로</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/heatmap')}
          style={{ backgroundColor: '#047857', padding: 12, borderRadius: 10, flex: 1 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>🔥 히트맵 보기</Text>
        </Pressable>
      </View>

      <LevelUpBurst visible={showLevelUp} onDone={() => setShowLevelUp(false)} />
    </View>
  );
}
