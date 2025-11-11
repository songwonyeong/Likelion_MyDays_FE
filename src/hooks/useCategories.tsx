// src/hooks/useCategories.tsx
import React, { useCallback, useContext, useMemo, useState } from "react";

export type Todo = {
  id: string;
  title: string;
  done: boolean;
  dateKey: string; // YYYY-MM-DD
};

export type Category = {
  id: string;
  name: string;
  color: string;
  todos: Todo[];
};

const k = (n: number) => String(n).padStart(2, "0");
export const toKey = (d: Date) =>
  `${d.getFullYear()}-${k(d.getMonth() + 1)}-${k(d.getDate())}`;

const todayKey = toKey(new Date());

// 초기 데모 데이터
const seed: Category[] = [
  {
    id: "c-urgent",
    name: "급한 업무",
    color: "#ef4444",
    todos: [{ id: "t-1", title: "청년주택신청", done: false, dateKey: todayKey }],
  },
  {
    id: "c-routine",
    name: "매일 루틴",
    color: "#7c3aed",
    todos: [
      { id: "t-2", title: "60-단어 암기", done: false, dateKey: todayKey },
      { id: "t-3", title: "60-15m 스터디", done: true, dateKey: todayKey },
      { id: "t-4", title: "듀오링고", done: true, dateKey: todayKey },
    ],
  },
];

type Store = {
  categories: Category[];
  createCategory: (name: string, color: string) => void;
  addTodo: (catId: string, title: string, dateKey: string) => void;
  toggleTodo: (catId: string, todoId: string) => void;
  reorderCategory: (from: number, to: number) => void;
  reorderTodo: (catId: string, from: number, to: number) => void;
  getDayStats: (dateKey: string) => {
    total: number;
    done: number;
    left: number; // 남은 개수(=total-done)
    colors: string[]; // 그날 사용된 카테고리 색들
  };
};

const CategoriesContext = React.createContext<Store | null>(null);

export const CategoriesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(seed);

  const createCategory = useCallback((name: string, color: string) => {
    const id = `c_${Date.now()}`;
    setCategories((prev) => [...prev, { id, name, color, todos: [] }]);
  }, []);

  const addTodo = useCallback((catId: string, title: string, dateKey: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, todos: [...c.todos, { id: `t_${Date.now()}`, title, done: false, dateKey }] }
          : c
      )
    );
  }, []);

  const toggleTodo = useCallback((catId: string, todoId: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, todos: c.todos.map((t) => (t.id === todoId ? { ...t, done: !t.done } : t)) }
          : c
      )
    );
  }, []);

  const reorderCategory = useCallback((from: number, to: number) => {
    setCategories((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  }, []);

  const reorderTodo = useCallback((catId: string, from: number, to: number) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        const arr = [...c.todos];
        const [moved] = arr.splice(from, 1);
        arr.splice(to, 0, moved);
        return { ...c, todos: arr };
      })
    );
  }, []);

  const getDayStats = useCallback(
    (dateKey: string) => {
      let total = 0;
      let done = 0;
      const colors: string[] = [];
      for (const c of categories) {
        const list = c.todos.filter((t) => t.dateKey === dateKey);
        if (list.length) colors.push(c.color);
        total += list.length;
        done += list.filter((t) => t.done).length;
      }
      return { total, done, left: total - done, colors };
    },
    [categories]
  );

  const value = useMemo<Store>(
    () => ({
      categories,
      createCategory,
      addTodo,
      toggleTodo,
      reorderCategory,
      reorderTodo,
      getDayStats,
    }),
    [categories, createCategory, addTodo, toggleTodo, reorderCategory, reorderTodo, getDayStats]
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
};

export function useCategories(): Store {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error("useCategories must be used within <CategoriesProvider>");
  return ctx;
}
