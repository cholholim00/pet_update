// components/LevelUpBurst.tsx
import React, { useEffect, useRef } from 'react';
import { View, Modal, Platform, Text } from 'react-native';

let LottieView: any = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  LottieView = require('lottie-react-native').default;
}

export default function LevelUpBurst({ visible, onDone }: { visible: boolean; onDone: ()=>void }) {
  const ref = useRef<any>(null);
  useEffect(() => { if (visible && ref.current?.play) ref.current.play(); }, [visible]);
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDone}>
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(0,0,0,0.4)' }}>
        {LottieView ? (
          <LottieView
            ref={ref}
            // ✅ 경로 수정: assets/anim
            source={require('../assets/animations/pet_growth.json')}
            autoPlay
            loop={false}
            onAnimationFinish={onDone}
            style={{ width: 280, height: 280 }}
          />
        ) : (
          <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: '700' }}>✨ Level Up!</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}
