// src/hooks/useCategories.tsx
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import * as TodosAPI from "../api/todos";
import * as CategoriesAPI from "../api/categories";

// ===== util =====
const k = (n: number) => String(n).padStart(2, "0");
export const toKey = (d: Date) => `${d.getFullYear()}-${k(d.getMonth() + 1)}-${k(d.getDate())}`;

// ===== models =====
export interface Category {
  id: number;
  name: string;
  color: string;
  order: number;
}

export interface Todo {
  id: number;
  content: string;
  date: string; // yyyy-MM-dd
  time: string | null;
  done: boolean;

  categoryId: number;
  category_name: string;
  category_color: string;
}

export type CategoryWithTodos = Category & { todos: Todo[] };

// Calendar.tsx Meta 타입 맞추기
export type Meta = { total: number; done: number; left: number; colors: string[] };

type Store = {
  categories: CategoryWithTodos[];
  selectedDateKey: string;
  setSelectedDateKey: (key: string) => void;

  refresh: (dateKey?: string) => Promise<void>;

  addTodo: (catId: number, title: string, dateKey: string) => Promise<void>;
  toggleTodo: (catId: number, todoId: number) => Promise<void>;

  reorderCategory: (from: number, to: number) => void;
  reorderTodo: (catId: number, from: number, to: number) => void;

  getMetaByDate: (d: Date) => Meta;
};

// ===== normalize =====
function normalizeTodo(raw: TodosAPI.TodoResp): Todo {
  return {
    id: raw.id,
    content: raw.content,
    date: raw.date,
    time: raw.time ?? null,
    done: raw.done,

    categoryId: Number(raw.categoryId ?? raw.category_id),
    category_name: raw.category_name,
    category_color: raw.category_color,
  };
}

function normalizeCategory(raw: CategoriesAPI.CategoryResp): Category {
  return {
    id: raw.id,
    name: raw.name,
    color: raw.color,
    order: raw.order ?? 0,
  };
}

// ===== context =====
const CategoriesContext = createContext<Store | null>(null);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const store = useProvideCategories();
  return <CategoriesContext.Provider value={store}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error("useCategories must be used within <CategoriesProvider />");
  return ctx;
}

// ===== main store =====
function useProvideCategories(): Store {
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => toKey(new Date()));

  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [todosByDate, setTodosByDate] = useState<Record<string, Todo[]>>({});

  /**
   * ✅ 핵심: refresh(dateKey)로 "조회할 날짜를 인자로 확정"
   * - state 갱신 타이밍이랑 상관없이 항상 올바른 date로 요청됨
   */
  const refresh = useCallback(
    async (dateKey?: string) => {
      const key = dateKey ?? selectedDateKey;

      const catsResp = await CategoriesAPI.getCategories();
      const cats = catsResp.map(normalizeCategory).sort((a, b) => a.order - b.order);
      setCategoryList(cats);

      const todosResp = await TodosAPI.getTodos({ date: key });
      const todos = (todosResp ?? []).map(normalizeTodo);

      setTodosByDate((prev) => ({ ...prev, [key]: todos }));
    },
    [selectedDateKey]
  );

  /**
   * ✅ 화면용 categories는 "선택한 날짜(selectedDateKey)" 기준으로만 조합
   * - CategoryList에서 날짜 필터링을 다시 하지 않아야 함
   */
  const categories: CategoryWithTodos[] = useMemo(() => {
    const todos = todosByDate[selectedDateKey] ?? [];

    return categoryList.map((c) => ({
      ...c,
      todos: todos.filter((t) => t.categoryId === c.id),
    }));
  }, [categoryList, todosByDate, selectedDateKey]);

  /**
   * ✅ Calendar 메타
   * getMeta는 Date를 받아야 하니까 여기서 Date->dateKey 변환
   */
  const getMetaByDate = useCallback(
    (d: Date): Meta => {
      const key = toKey(d);
      const todos = todosByDate[key] ?? [];
      const total = todos.length;
      const done = todos.filter((t) => t.done).length;
      const left = total - done;

      const colors = Array.from(
        new Set(todos.filter((t) => t.done).map((t) => t.category_color).filter(Boolean))
      );

      return { total, done, left, colors };
    },
    [todosByDate]
  );

  const addTodo = useCallback(
    async (catId: number, title: string, dateKey: string) => {
      await TodosAPI.createTodo({
        categoryId: catId,
        content: title,
        date: dateKey,
      });

      // ✅ 추가한 날짜만 정확히 재조회
      await refresh(dateKey);
    },
    [refresh]
  );

  const toggleTodo = useCallback(
    async (_catId: number, todoId: number) => {
      // 현재 선택된 날짜의 목록에서 todo 찾아서 done 반전값 계산
      const list = todosByDate[selectedDateKey] ?? [];
      const target = list.find((t) => t.id === todoId);
      if (!target) {
        // 못 찾으면 그냥 재조회
        await refresh(selectedDateKey);
        return;
      }

      await TodosAPI.toggleTodoDone(todoId, !target.done);
      await refresh(selectedDateKey);
    },
    [todosByDate, selectedDateKey, refresh]
  );

  // reorder는 화면에서만 정렬(서버 저장 API 없어서)
  const reorderCategory = useCallback((from: number, to: number) => {
    setCategoryList((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((c, idx) => ({ ...c, order: idx }));
    });
  }, []);

  const reorderTodo = useCallback(
    (catId: number, from: number, to: number) => {
      setTodosByDate((prev) => {
        const key = selectedDateKey;
        const list = prev[key] ?? [];

        // 해당 카테고리 투두들의 "실제 인덱스" 목록
        const idxs = list
          .map((t, i) => ({ t, i }))
          .filter(({ t }) => t.categoryId === catId)
          .map(({ i }) => i);

        const realFrom = idxs[from];
        const realTo = idxs[to];
        if (realFrom == null || realTo == null) return prev;

        const next = [...list];
        const [moved] = next.splice(realFrom, 1);
        next.splice(realTo, 0, moved);

        return { ...prev, [key]: next };
      });
    },
    [selectedDateKey]
  );

  return {
    categories,
    selectedDateKey,
    setSelectedDateKey,
    refresh,
    addTodo,
    toggleTodo,
    reorderCategory,
    reorderTodo,
    getMetaByDate,
  };
}
