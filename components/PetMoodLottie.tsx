// components/PetMoodLottie.tsx
import React, { useEffect, useRef } from 'react';
import { Platform, Text } from 'react-native';

let LottieView: any = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  LottieView = require('lottie-react-native').default;
}

type Props = { emotion: 'sad' | 'tired' | 'calm' | 'happy'; size?: number };

export default function PetMoodLottie({ emotion, size = 180 }: Props) {
  const ref = useRef<any>(null);

  useEffect(() => {
    ref.current?.play?.();
  }, [emotion]);

  if (!LottieView) {
    return <Text style={{ color: 'white', fontWeight: '700' }}>🐾 {emotion}</Text>;
  }

  // 아래 파일을 /assets/anim/ 에 추가해주세요:
  // pet_sad.json, pet_tired.json, pet_calm.json, pet_happy.json
  const sourceMap: Record<Props['emotion'], any> = {
    sad: require('../assets/anim/pet_sad.json'),
    tired: require('../assets/anim/pet_tired.json'),
    calm: require('../assets/anim/pet_calm.json'),
    happy: require('../assets/anim/pet_happy.json'),
  };

  return (
    <LottieView
      ref={ref}
      source={sourceMap[emotion]}
      autoPlay
      loop
      style={{ width: size, height: size }}
    />
  );
}
