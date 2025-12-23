// src/pages/Main.tsx
import { useEffect, useMemo, useState } from "react";
import { useCategories, toKey } from "../hooks/useCategories";
import Calendar from "../components/Calendar";
import CategoryList from "../components/CategoryList";
import MainTopBar from "../components/MainTopBar";

export default function Main() {
  const store = useCategories();

  const [baseDate, setBaseDate] = useState(() => {
    const t = new Date();
    t.setDate(1);
    return t;
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateKey = useMemo(() => toKey(selectedDate), [selectedDate]);

  // ✅ 날짜 바뀔 때 store도 갱신 + 서버 재조회
  useEffect(() => {
    store.setSelectedDateKey(dateKey);
    // store.refresh()는 useCategories 내부에서 selectedDateKey를 참조하므로
    // setSelectedDateKey 후 약간 안정적으로 갱신되게 다음 tick에서 호출
    Promise.resolve().then(() => store.refresh());
  }, [dateKey]); // store 넣으면 참조변경으로 재실행될 수 있어서 dateKey만 둠

  return (
    <>
      <MainTopBar title="MyDays" />

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 28,
            alignItems: "start",
          }}
        >
          <section>
            <Calendar
              baseDate={baseDate}
              selectedDate={selectedDate}
              onPrevMonth={() =>
                setBaseDate(new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1))
              }
              onNextMonth={() =>
                setBaseDate(new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1))
              }
              onSelectDate={(d) => setSelectedDate(d)}
              getMeta={(d) => store.getDayStats(toKey(d))}
            />
          </section>

          <aside className="transition-all duration-200 ease-out">
            <div key={dateKey} className="animate-[fadeIn_.18s_ease-out]">
              <CategoryList
                dateKey={dateKey}
                categories={store.categories}
                addTodo={(catId, title) => store.addTodo(catId, title, dateKey)}
                toggleTodo={(catId, todoId) => store.toggleTodo(catId, todoId)}
                reorderCategory={store.reorderCategory}
                reorderTodo={store.reorderTodo}
              />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
