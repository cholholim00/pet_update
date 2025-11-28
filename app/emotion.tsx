// app/emotion.tsx
import React, { useMemo } from 'react';
import { View, Text, Image, ImageBackground, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePetStore } from '../store/usePet';
import { inferEmotion, HealingMessages, EmotionBg, EmotionPetAnim, type EmotionKey } from '../lib/emotionData';
import { useBgm } from '../hooks/useBgm';

// ── Lottie: web에서는 경고 없이 텍스트 대체
let LottieView: any = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  try {LottieView = require('lottie-react-native').default; } catch (e) { LottieView = null; }
}

export default function EmotionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Zustand에서 mood, lastEntry, bgmEnabled 사용 (없으면 기본값 처리)
  const mood = usePetStore((s) => s.mood ?? 50);
  const lastEntry = usePetStore((s) => s.lastEntry);
  const bgmEnabledFromStore = usePetStore((s) => (s as any).bgmEnabled ?? true);
  const toggleBgmFromStore = (usePetStore.getState() as any).toggleBgm;

  const promptTags = lastEntry?.prompts ?? [];
  const emotion: EmotionKey = useMemo(() => inferEmotion(mood, promptTags), [mood, promptTags]);
  const messages = HealingMessages[emotion];
  const bgSource = EmotionBg[emotion]; // 10장 배경 매핑

  // BGM (없으면 자동 skip)
  useBgm(emotion, bgmEnabledFromStore, 0.55);

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {/* 배경 */}
      <ImageBackground source={bgSource} style={{ flex: 1 }} resizeMode="cover">

        {/* 상단 바 */}
        <View
          style={{
            paddingTop: insets.top + 8,
            paddingHorizontal: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Pressable
            onPress={() => router.push('/')}
            style={{ backgroundColor: 'rgba(0,0,0,0.35)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>🏠 홈</Text>
          </Pressable>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => router.push('/heatmap')}
              style={{ backgroundColor: 'rgba(0,0,0,0.35)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>📅 히트맵</Text>
            </Pressable>

            <Pressable
              onPress={() => (toggleBgmFromStore ? toggleBgmFromStore() : null)}
              style={{ backgroundColor: 'rgba(0,0,0,0.35)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>
                🔊 BGM {bgmEnabledFromStore ? '끄기' : '켜기'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 펫 리액션 */}
       <View style={{ alignItems: 'center', marginTop: 40 }}>
  {LottieView && EmotionPetAnim[emotion] ? (
    <LottieView
      source={EmotionPetAnim[emotion]}
      autoPlay
      loop
      style={{ width: 200, height: 200 }}
    />
  ) : (
    <View style={{ backgroundColor: 'rgba(0,0,0,0.35)', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 }}>
      <Text style={{ color: 'white', fontWeight: '800' }}>🐾 {emotion}</Text>
    </View>
  )}
</View>

        {/* 힐링 문구 */}
        <View
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: insets.bottom + 28,
            alignItems: 'center',
          }}
        >
          <View style={{ backgroundColor: 'rgba(0,0,0,0.35)', padding: 16, borderRadius: 12 }}>
            <Text
              style={{
                color: 'white',
                fontSize: 20,
                lineHeight: 28,
                fontWeight: '700',
                textAlign: 'center',
                textShadowColor: '#000',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 4,
              }}
            >
              {messages[Math.floor(Math.random() * messages.length)]}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
