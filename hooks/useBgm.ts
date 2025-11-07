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
    let active = true;

    (async () => {
      await ensureAudioMode();

      // 기존 사운드 정리
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        } catch {}
        soundRef.current = null;
      }

      // 꺼져있으면 skip
      if (!enabled) return;

      // 새 사운드 로드
      try {
        const s = new Audio.Sound();
        soundRef.current = s;
        await s.loadAsync(EmotionBgm[emotion], {
          shouldPlay: true,
          isLooping: true,
          volume,
        });
      } catch (e) {
        console.warn('BGM load error', e);
      }
    })();

    // 언마운트 시 정리
    return () => {
      active = false;
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
  }, [emotion, enabled]);
}
