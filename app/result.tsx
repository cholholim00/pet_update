import { View, Text, Pressable } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { usePetStore } from '../store/usePet';

export default function Result(){
  const { xp } = useLocalSearchParams<{ xp:string }>();
  const { pet } = usePetStore();
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:20, gap:12 }}>
      <Text style={{ fontSize:24, fontWeight:'700' }}>오늘의 보상</Text>
      <Text>XP +{xp}</Text>
      <Text>현재 펫 레벨: {pet?.level}</Text>
      <Link href='/' asChild>
        <Pressable style={{ backgroundColor:'black', padding:12, borderRadius:12 }}>
          <Text style={{ color:'white'}}>홈으로</Text>
        </Pressable>
      </Link>
    </View>
  );
}
