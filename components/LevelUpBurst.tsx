import { useEffect, useRef } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import LottieView from 'lottie-react-native';

type Props = {
  visible: boolean;
  onDone?: () => void;
};

export default function LevelUpBurst({ visible, onDone }: Props) {
  const ref = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      ref.current?.play(0, 120); // 애니 길이에 맞게 조절
      // 안전장치: 2.0초 후 자동 닫기 (JSON에 따라 조정)
      const t = setTimeout(() => onDone?.(), 2000);
      return () => clearTimeout(t);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDone}>
      <View style={styles.backdrop}>
        <LottieView
          ref={ref}
          source={require('../assets/anim/level-up.json')}
          autoPlay
          loop={false}
          style={{ width: 300, height: 300 }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
