// lib/soundMap.ts
import type { EmotionKey } from './emotionData';

export const EmotionBgm: Record<EmotionKey, any> = {
  sad:       require('../assets/sound/sad.mp3'),
  lonely:    require('../assets/sound/lonely.mp3'),
  anxious:   require('../assets/sound/anxious.mp3'),
  stressed:  require('../assets/sound/stressed.mp3'),
  tired:     require('../assets/sound/tired.mp3'),
  calm:      require('../assets/sound/calm.mp3'),
  hopeful:   require('../assets/sound/hopeful.mp3'),
  grateful:  require('../assets/sound/grateful.mp3'),
  happy:     require('../assets/sound/happy.mp3'),
  excited:   require('../assets/sound/excited.mp3'),
};
