// src/components/Calendar.tsx
import React, { useMemo, useState } from "react";

type Meta = { total: number; done: number; left: number; colors: string[] };

type Props = {
  baseDate: Date;
  selectedDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (d: Date) => void;
  getMeta?: (d: Date) => Meta;
};

const k = (n: number) => String(n).padStart(2, "0");
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function getMonthCells(baseDate: Date) {
  const first = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const firstDay = first.getDay();
  const last = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
  const lastDate = last.getDate();

  const arr: Array<Date | null> = [];
  for (let i = 0; i < firstDay; i++) arr.push(null);
  for (let d = 1; d <= lastDate; d++) arr.push(new Date(baseDate.getFullYear(), baseDate.getMonth(), d));
  while (arr.length < 42) arr.push(null);
  return arr;
}

function getWeekCells(selectedDate: Date) {
  const d = startOfDay(selectedDate);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);

  const arr: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    arr.push(x);
  }
  return arr;
}

function buildGradient(colors: string[]) {
  const uniq = Array.from(new Set((colors ?? []).filter(Boolean)));
  if (uniq.length === 0) return null;
  if (uniq.length === 1) return `linear-gradient(135deg, ${uniq[0]}33, ${uniq[0]}22)`;
  if (uniq.length === 2) return `linear-gradient(135deg, ${uniq[0]}33, ${uniq[1]}33)`;
  return `linear-gradient(135deg, ${uniq.slice(0, 4).map((c) => `${c}33`).join(", ")})`;
}

export default function Calendar({
  baseDate,
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  getMeta,
}: Props) {
  const [mode, setMode] = useState<"month" | "week">("month");
  const today = useMemo(() => startOfDay(new Date()), []);
  const monthLabel = `${baseDate.getFullYear()}년 ${k(baseDate.getMonth() + 1)}월`;
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

  const monthCells = useMemo(() => getMonthCells(baseDate), [baseDate]);
  const weekCells = useMemo(() => getWeekCells(selectedDate), [selectedDate]);
  const cells = mode === "month" ? monthCells : weekCells;

  return (
    <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-7">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="text-lg font-extrabold text-gray-900 truncate">{monthLabel}</div>
          {mode === "week" && (
            <div className="text-xs text-gray-500 mt-1">
              주간 보기 · {selectedDate.getMonth() + 1}/{selectedDate.getDate()}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-2xl border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setMode("month")}
              className={[
                "px-3 py-1.5 text-sm font-semibold rounded-xl transition",
                mode === "month" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-800",
              ].join(" ")}
            >
              월
            </button>
            <button
              type="button"
              onClick={() => setMode("week")}
              className={[
                "px-3 py-1.5 text-sm font-semibold rounded-xl transition",
                mode === "week" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-800",
              ].join(" ")}
            >
              주
            </button>
          </div>

          <button
            type="button"
            onClick={onPrevMonth}
            className="h-9 w-9 rounded-2xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition"
            aria-label="이전 달"
          >
            <span className="text-lg font-bold">‹</span>
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="h-9 w-9 rounded-2xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition"
            aria-label="다음 달"
          >
            <span className="text-lg font-bold">›</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 mb-2">
        {weekdays.map((w, idx) => (
          <div key={w} className={idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : ""}>
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((d: any, i: number) => {
          if (mode === "month" && d === null) return <div key={i} className="h-12" />;

          const date = d as Date;
          const isSelected = sameDay(date, selectedDate);
          const isToday = sameDay(date, today);

          const meta = getMeta?.(date);
          const left = meta?.left ?? 0;
          const total = meta?.total ?? 0;
          const doneAll = total > 0 && left === 0;

          const gradient = doneAll ? buildGradient(meta?.colors ?? []) : null;

          const baseClass =
            "relative h-12 rounded-2xl border text-sm font-semibold transition flex items-center justify-center";
          const selectedClass = "bg-gray-900 text-white border-gray-900 shadow-sm";
          const normalClass = "bg-white text-gray-900 border-gray-200 hover:bg-gray-50 active:bg-gray-100";

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDate(date)}
              className={[baseClass, isSelected ? selectedClass : normalClass].join(" ")}
              style={
                !isSelected && gradient
                  ? { backgroundImage: gradient, borderColor: "#e5e7eb" }
                  : undefined
              }
            >
              {!isSelected && isToday && (
                <span className="absolute top-1 left-1 h-2 w-2 rounded-full bg-gray-900" />
              )}

              {date.getDate()}

              {left > 0 && (
                <span className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gray-900 text-white text-[11px] font-extrabold flex items-center justify-center shadow-sm">
                  {left}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
