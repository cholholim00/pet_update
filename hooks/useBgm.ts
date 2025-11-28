import { useEffect, useRef } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import type { EmotionKey } from '../lib/emotionData';
import { EmotionBgm } from '../lib/soundMap';

// 오디오 모드 한 번만 설정
let modeSet = false;
async function ensureAudioMode() {
  if (modeSet) return;
  await Audio.setAudioModeAsync({
    staysActiveInBackground: false,
    interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true, // 무음 모드에서도 재생
    shouldDuckAndroid: true,
  });
  modeSet = true;
}
export function useBgm(emotion: EmotionKey, enabled = true, volume = 0.6) {
  const soundRef = useRef<Audio.Sound | null>(null);
  
 useEffect(() => {
    // 🔹 BGM 파일이 없으면 그냥 아무 것도 안 함
    if (!EmotionBgm[emotion] || !enabled) {
      return;
    }

    let active = true;

    (async () => {
      await ensureAudioMode();

      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        } catch {}
        soundRef.current = null;
      }

      try {
        const s = new Audio.Sound();
        soundRef.current = s;
        await s.loadAsync(EmotionBgm[emotion] as any, {
          shouldPlay: true,
          isLooping: true,
          volume,
        });
      } catch (e) {
        console.warn('BGM load error', e);
      }
    })();

    return () => {
      (async () => {
        if (soundRef.current) {
          try {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
          } catch {}
          soundRef.current = null;
        }
      })();
    };
  }, [emotion, enabled, volume]);
}
