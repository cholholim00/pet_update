// components/HeatmapCalendar.tsx
import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';

type Level = 0 | 1 | 2 | 3 | 4;
type Props = {
  levels: Record<string, Level>; // 'YYYY-MM-DD' -> 0..4
  weeks?: number;                // 표시 주 수(기본 12)
  startOnSunday?: boolean;       // 일요일 시작 여부
  currentStreak?: number;        // 현재 연속 작성 일수
  bestStreak?: number;           // 최장 연속 작성 일수
};

function toISO(d: Date) { return d.toISOString().slice(0,10); }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }

export default function HeatmapCalendar({
  levels,
  weeks = 12,
  startOnSunday = true,
  currentStreak = 0,
  bestStreak = 0,
}: Props) {
  const today = useMemo(() => { const t = new Date(); t.setHours(0,0,0,0); return t; }, []);

  // 주(열) × 요일(행) 그리드 생성
  const columns = useMemo(() => {
    const cols: { date: string; level: Level }[][] = [];
    const end = new Date(today);
    const weekday = end.getDay(); // 0=Sun
    const offset = startOnSunday ? weekday : (weekday === 0 ? 6 : weekday-1);

    const totalDays = weeks * 7;
    const startDate = addDays(end, -(totalDays-1) - offset);

    for (let w = 0; w < weeks; w++) {
      const col: { date: string; level: Level }[] = [];
      for (let r = 0; r < 7; r++) {
        const d = addDays(startDate, w*7 + r);
        const iso = toISO(d);
        const level = (levels[iso] ?? 0) as Level;
        col.push({ date: iso, level });
      }
      cols.push(col);
    }
    return cols;
  }, [today, weeks, startOnSunday, levels]);

  // 색상 팔레트(원하면 바꿔도 됨)
  const color = (l: Level) => {
    switch (l) {
      case 0: return '#e5e7eb'; // gray-200
      case 1: return '#86efac'; // green-300
      case 2: return '#4ade80'; // green-400
      case 3: return '#22c55e'; // green-500
      case 4: return '#16a34a'; // green-600
    }
  };

  return (
    <View style={{ gap: 10 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {columns.map((col, i) => (
            <View key={i} style={{ gap: 4 }}>
              {col.map((cell) => (
                <View
                  key={cell.date}
                  accessibilityLabel={`${cell.date} level ${cell.level}`}
                  style={{
                    width: 14, height: 14, borderRadius: 3,
                    backgroundColor: color(cell.level)
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
