import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import PetCard from '../components/PetCard';
import LevelUpBurst from '../components/LevelUpBurst';
import { usePetStore } from '../store/usePet';

export default function Home(){
  const { streak, justLeveled, ackLevelUp } = usePetStore();
  return (
    <View style={{ flex:1, padding:20, gap:16, justifyContent:'center' }}>
      <Text style={{ fontSize:24, fontWeight:'700' }}>오늘의 일기 → MY펫 성장</Text>
      <PetCard />
      <Text>연속 작성: {streak}일</Text>

      <Link href="/journal" asChild>
        <Pressable style={{ backgroundColor:'black', padding:16, borderRadius:12 }}>
          <Text style={{ color:'white', textAlign:'center', fontWeight:'700'}}>오늘의 일기 쓰기</Text>
        </Pressable>
      </Link>

      <Link href="/history" asChild>
        <Pressable style={{ borderWidth:1, padding:12, borderRadius:12 }}>
          <Text style={{ textAlign:'center' }}>지난 일기 보기</Text>
        </Pressable>
      </Link>

      <Link href="/heatmap" asChild>
        <View style={{ borderWidth:1, padding:12, borderRadius:12 }}>
          <Text style={{ textAlign:'center' }}>히트맵 달력 보기</Text>
        </View>
      </Link>

          {/* ✅ 레벨업 애니 오버레이 */}
      <LevelUpBurst visible={justLeveled} onDone={ackLevelUp} />
    </View>
  );
}
