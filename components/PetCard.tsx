import { View, Text } from 'react-native';
import { usePetStore } from '../store/usePet';

export default function PetCard(){
  const { pet } = usePetStore();

  if(!pet) {
    return (
    <View style={{ borderWidth:1, borderRadius:12, padding:16 }}>
      <Text>펫이 생성되지 않았어요. 첫 일기를 제출하면 나타납니다!</Text>
    </View>
    );
  }

  return (
    <View style={{ borderWidth:1, borderRadius:12, padding:16 }}>
      <Text style={{ fontWeight:'700' }}>{pet.name}</Text>
      <Text>레벨 {pet.level} (XP {pet.xp}/100)</Text>
      <Text>친밀도 {pet.bond}/5</Text>
      <Text>기분 {pet.mood}</Text>
    </View>
  );
}
