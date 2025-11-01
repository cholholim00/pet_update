// components/EmotionScene.tsx
import React from 'react';
import { ImageBackground } from 'react-native';

type Props = { emotion: 'sad' | 'tired' | 'calm' | 'happy' };

export default function EmotionScene({ emotion }: Props) {
  const bgMap = {
    sad: require('../assets/bg/bg_starlight.png'),
    tired: require('../assets/bg/bg_forest.png'),
    calm: require('../assets/bg/bg_ocean.png'),
    happy: require('../assets/bg/bg_meadow.png'),
  };
  return (
    <ImageBackground
      source={bgMap[emotion]}
      style={{ flex: 1, width: '100%', height: '100%' }}
      resizeMode="cover"
    />
  );
}
