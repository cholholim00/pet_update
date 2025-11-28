// components/HeatmapCalendar.tsx
import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';

type Level = 0 | 1 | 2 | 3 | 4;
type Props = {
  levels: Record<string, Level>;        // YYYY-MM-DD -> 0..4
  weeks?: number;                       // default 12
  startOnSunday?: boolean;              // default true
  currentStreak?: number;
  bestStreak?: number;
  onPressDate?: (iso: string) => void;  // ✅ 셀 탭 콜백
};

function toISO(d: Date) { return d.toISOString().slice(0,10); }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }
const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function HeatmapCalendar({
  levels,
  weeks = 12,
  startOnSunday = true,
  currentStreak = 0,
  bestStreak = 0,
  onPressDate,
}: Props) {

  const today = useMemo(() => { const t = new Date(); t.setHours(0,0,0,0); return t; }, []);

  // 그리드 생성 + 월 라벨 포인트 수집
  const { columns, monthTicks } = useMemo(() => {
    const cols: { date: string; level: Level; month: number }[][] = [];
    const end = new Date(today);
    const weekday = end.getDay(); // 0=Sun
    const offset = startOnSunday ? weekday : (weekday === 0 ? 6 : weekday-1);

    const totalDays = weeks * 7;
    const startDate = addDays(end, -(totalDays-1) - offset);

    const ticks: { x: number; month: number }[] = [];

    for (let w = 0; w < weeks; w++) {
      const col: { date: string; level: Level; month: number }[] = [];
      for (let r = 0; r < 7; r++) {
        const d = addDays(startDate, w*7 + r);
        const iso = toISO(d);
        const level = (levels[iso] ?? 0) as Level;
        const m = d.getMonth();
        col.push({ date: iso, level, month: m });
      }
      // 각 주의 첫 칸(상단)이 새로운 달이면 라벨 찍기
      const top = col[0];
      const prevWeekTop = w > 0 ? cols[w-1][0] : null;
      if (!prevWeekTop || prevWeekTop.month !== top.month) {
        ticks.push({ x: w, month: top.month });
      }
      cols.push(col);
    }
    return { columns: cols, monthTicks: ticks };
  }, [today, weeks, startOnSunday, levels]);

  const color = (l: Level) => {
    switch (l) {
      case 0: return '#e5e7eb';
      case 1: return '#86efac';
      case 2: return '#4ade80';
      case 3: return '#22c55e';
      case 4: return '#16a34a';
    }
  };

  return (
    <View style={{ gap: 8 }}>
      {/* 월 라벨 */}
      <View style={{ marginLeft: 24, flexDirection: 'row' }}>
        {/* 빈 좌측 라벨 공간 24px 고려 */}
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {Array.from({ length: columns.length }).map((_, i) => {
            const tick = monthTicks.find(t => t.x === i);
            return (
              <View key={i} style={{ width: 14, alignItems: 'center' }}>
                {tick ? <Text style={{ fontSize: 10, color: '#6b7280' }}>{monthNames[tick.month]}</Text> : <Text style={{ fontSize: 10 }}> </Text>}
              </View>
            );
          })}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
        {/* 요일 라벨 (Sun/Tue/Thu만) */}
       

        {/* 그리드 */}
        <View style={{ flexDirection: 'row', gap: 4, paddingTop: 14 }}>
          {columns.map((col, i) => (
            <View key={i} style={{ gap: 4 }}>
              {col.map((cell, r) => (
                <Pressable
                  key={cell.date}
                  onPress={() => onPressDate?.(cell.date)}
                  android_ripple={{ color: '#00000022' }}
                  style={{
                    width: 14, height: 14, borderRadius: 3,
                    backgroundColor: color(cell.level),
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 범례 + streak */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <Text style={{ fontSize: 12, color: '#6b7280' }}>Less</Text>
        {[0,1,2,3,4].map(l => (
          <View key={l} style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: color(l as Level) }} />
        ))}
        <Text style={{ fontSize: 12, color: '#6b7280' }}>More</Text>
        <View style={{ width: 8 }} />
        <Text style={{ fontSize: 12, color: '#111827' }}>
          Streak {currentStreak}d / Best {bestStreak}d
        </Text>
      </View>
    </View>
  );
}
