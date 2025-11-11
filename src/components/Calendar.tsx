// src/components/Calendar.tsx
import React from "react";

type DayMeta = { total: number; done: number; left: number; colors: string[] };

type Props = {
  baseDate: Date;
  selectedDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (d: Date) => void;
  getMeta: (d: Date) => DayMeta;
};

const WEEK = ["월", "화", "수", "목", "금", "토", "일"];

export default function Calendar({
  baseDate,
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  getMeta,
}: Props) {
  const y = baseDate.getFullYear();
  const m = baseDate.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const start = (first.getDay() + 6) % 7;
  const days = last.getDate();

  const cells: (number | null)[] = Array(start).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const grid7: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  };

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-2">
        <button onClick={onPrevMonth} className="border rounded-md px-3 py-1">
          &lt;
        </button>
        <button onClick={onNextMonth} className="border rounded-md px-3 py-1">
          &gt;
        </button>
      </div>

      <div className="font-bold text-xl mb-2">
        {y}년 {m + 1}월
      </div>

      <div className="text-sm font-semibold text-gray-400" style={{ ...grid7, textAlign: "center" }}>
        {WEEK.map((w) => (
          <div key={w} style={{ padding: "4px 0" }}>
            {w}
          </div>
        ))}
      </div>

      <div style={{ ...grid7, rowGap: 12, marginTop: 8, textAlign: "center" }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={`e-${i}`} />;
          const date = new Date(y, m, d);
          const sel =
            date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate();

          const meta = getMeta(date);
          const allDone = meta.total > 0 && meta.left === 0;

          const bg =
            allDone && meta.colors.length > 0
              ? `linear-gradient(135deg, ${meta.colors.join(",")})`
              : sel
              ? "#111"
              : "#fff";
          const border = sel ? "2px solid #111" : "1px solid #e5e7eb";
          const color = sel ? "#fff" : "#111";

          return (
            <div key={`d-${d}`} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => onSelectDate(date)}
                className="relative inline-flex items-center justify-center"
                style={{
                  width: 36,
                  height: 36,
                  margin: "0 auto",
                  borderRadius: 9999,
                  border,
                  background: bg,
                  color,
                }}
              >
                {d}
              </button>

              {/* 남은 개수만 표기 */}
              {meta.left > 0 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: -10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 11,
                    lineHeight: 1,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 999,
                    background: "#fef3c7",
                    color: "#92400e",
                    border: "1px solid #f59e0b",
                  }}
                  title="남은 할 일"
                >
                  {meta.left}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
