// src/pages/Main.tsx
import React, { useMemo, useState } from "react";
import { useCategories, toKey } from "../hooks/useCategories";
import Calendar from "../components/Calendar";
import CategoryList from "../components/CategoryList";
import TopRightMenu from "../components/TopRightMenu";

export default function Main() {
  const store = useCategories();

  const [baseDate, setBaseDate] = useState(() => {
    const t = new Date();
    t.setDate(1);
    return t;
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateKey = useMemo(() => toKey(selectedDate), [selectedDate]);

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 16px" }}>
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold">My Days</h1>
        <TopRightMenu />
      </header>

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
              setBaseDate(
                new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1)
              )
            }
            onNextMonth={() =>
              setBaseDate(
                new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1)
              )
            }
            onSelectDate={setSelectedDate}
            getMeta={(d) => store.getDayStats(toKey(d))}
          />
        </section>

        <aside>
          <CategoryList
            dateKey={dateKey}
            categories={store.categories}
            addTodo={(catId, title) => store.addTodo(catId, title, dateKey)}
            toggleTodo={store.toggleTodo}
            reorderCategory={store.reorderCategory}
            reorderTodo={store.reorderTodo}
          />
        </aside>
      </div>
    </div>
  );
}
