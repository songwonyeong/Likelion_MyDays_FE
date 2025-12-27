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

  // ✅ 날짜 바뀔 때: 선택키 저장 + 해당 날짜로 서버 재조회(핵심: dateKey를 인자로 넘김)
  useEffect(() => {
    store.setSelectedDateKey(dateKey);
    // ✅ tick 밀 필요 없음. 인자로 dateKey 주니까 스테일 이슈 없음.
    store.refresh(dateKey);
  }, [dateKey]); // store 넣으면 참조 변경으로 재실행될 수 있어 dateKey만

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
              // ✅ Calendar가 요구하는 Meta 리턴 (Date 그대로 넘김)
              getMeta={(d) => store.getMetaByDate(d)}
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
                reorderTodo={(catId, from, to) => store.reorderTodo(catId, from, to)}
              />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
