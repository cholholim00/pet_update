// app/emotion.tsx
import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { usePetStore } from '../store/usePet';
import { getEmotionKey, HealingMessages } from '../lib/emotionData';
import EmotionScene from '../components/EmotionScene';
import HealingMessage from '../components/HealingMessage';
import PetMoodLottie from '../components/PetMoodLottie';

export default function EmotionScreen() {
  const router = useRouter();
  const mood = usePetStore(s => s.mood);
  const emotion = getEmotionKey(mood);
  const messages = HealingMessages[emotion];

  return (
    <View style={{ flex: 1 }}>
      <EmotionScene emotion={emotion} />

      <View
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
      >
        <PetMoodLottie emotion={emotion} />
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: 110,
          left: 16,
          right: 16,
          alignItems: 'center',
        }}
      >
        <HealingMessage messages={messages} />
      </View>

      <View style={{ position: 'absolute', bottom: 30, left: 16, right: 16, gap: 10 }}>
        <Pressable
          onPress={() => router.push('/')}
          style={{ backgroundColor: '#111827', padding: 12, borderRadius: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>🏠 홈으로</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/heatmap')}
          style={{ backgroundColor: '#047857', padding: 12, borderRadius: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>
            📅 히트맵 보기
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
