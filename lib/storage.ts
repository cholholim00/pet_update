import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry } from '../store/types';

const KEY_DATES = 'journal_dates';

export async function saveJournalEntry(e: JournalEntry){
  await AsyncStorage.setItem(`journal_${e.date}`, JSON.stringify(e));
  const raw = await AsyncStorage.getItem(KEY_DATES);
  const arr = raw? JSON.parse(raw) as string[] : [];
  const next = Array.from(new Set([...arr, e.date]));
  await AsyncStorage.setItem(KEY_DATES, JSON.stringify(next));
}

export async function loadDates(){
  const raw = await AsyncStorage.getItem(KEY_DATES);
  return raw? JSON.parse(raw) as string[] : [];
}

/** ✅ 삭제 */
export async function deleteJournalEntry(date: string){
  await AsyncStorage.removeItem(`journal_${date}`);
  const raw = await AsyncStorage.getItem(KEY_DATES);
  const arr = raw? JSON.parse(raw) as string[] : [];
  const next = arr.filter((d)=> d !== date);
  await AsyncStorage.setItem(KEY_DATES, JSON.stringify(next));
}

/** (선택) 단건 조회 */
export async function getJournalEntry(date: string){
  const raw = await AsyncStorage.getItem(`journal_${date}`);
  return raw? JSON.parse(raw) as JournalEntry : null;
}
