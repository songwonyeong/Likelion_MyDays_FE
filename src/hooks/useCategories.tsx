// // // src/hooks/useCategories.tsx
// // import React, { useCallback, useContext, useMemo, useState } from "react";
// // import * as CategoriesAPI from "../api/categories";
// // import * as TodosAPI from "../api/todos";

// // // ===== 모델 =====
// // export interface Category {
// //   id: number;
// //   name: string;
// //   color: string;
// //   order: number;
// // }

// // export interface Todo {
// //   id: number;
// //   title: string;
// //   memo: string | null;
// //   date: string; // yyyy-MM-dd
// //   time: string | null;
// //   completed: boolean;
// //   category: Category;
// // }

// // const k = (n: number) => String(n).padStart(2, "0");
// // export const toKey = (d: Date) =>
// //   `${d.getFullYear()}-${k(d.getMonth() + 1)}-${k(d.getDate())}`;

// // // ===== store 타입 =====
// // export type CategoryWithTodos = Category & { todos: Todo[] };

// // type Store = {
// //   selectedDateKey: string;
// //   setSelectedDateKey: (k: string) => void;

// //   categories: CategoryWithTodos[];

// //   // 서버 동기화
// //   refresh: () => Promise<void>;

// //   createCategory: (name: string, color: string) => Promise<void>;

// //   addTodo: (categoryId: number, title: string, dateKey: string) => Promise<void>;
// //   toggleTodo: (categoryId: number, todoId: number) => Promise<void>;
// //   deleteTodo: (todoId: number) => Promise<void>;

// //   // 드래그 정렬은 “지금 백엔드 스펙에 없음” → 일단 UI용으로만 유지(서버 반영 X)
// //   reorderCategory: (from: number, to: number) => void;
// //   reorderTodo: (catId: number, from: number, to: number) => void;

// //   getDayStats: (dateKey: string) => { total: number; done: number; left: number; colors: string[] };
// // };

// // const CategoriesContext = React.createContext<Store | null>(null);

// // export const CategoriesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
// //   const [selectedDateKey, setSelectedDateKey] = useState<string>(toKey(new Date()));
// //   const [categories, setCategories] = useState<CategoryWithTodos[]>([]);

// //   const buildCategories = useCallback((cats: Category[], todos: Todo[]) => {
// //     const map = new Map<number, CategoryWithTodos>();
// //     for (const c of cats) map.set(c.id, { ...c, todos: [] });
// //     for (const t of todos) {
// //       const owner = map.get(t.category.id);
// //       if (owner) owner.todos.push(t);
// //     }
// //     // order 기준 정렬
// //     return Array.from(map.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
// //   }, []);

// //   const refresh = useCallback(async () => {
// //     const [cats, todos] = await Promise.all([
// //       CategoriesAPI.getCategories(),
// //       TodosAPI.getTodos({ date: selectedDateKey }),
// //     ]);

// //     // API 응답을 프론트 모델로 맞추기(타입 호환)
// //     const catModel: Category[] = cats.map((c) => ({ id: c.id, name: c.name, color: c.color, order: c.order ?? 0 }));
// //     const todoModel: Todo[] = todos.map((t) => ({
// //       id: t.id,
// //       title: t.title,
// //       memo: t.memo ?? null,
// //       date: t.date,
// //       time: t.time ?? null,
// //       completed: t.completed,
// //       category: {
// //         id: t.category.id,
// //         name: t.category.name,
// //         color: t.category.color,
// //         order: t.category.order ?? 0,
// //       },
// //     }));

// //     setCategories(buildCategories(catModel, todoModel));
// //   }, [selectedDateKey, buildCategories]);

// //   const createCategory = useCallback(async (name: string, color: string) => {
// //     await CategoriesAPI.createCategory({ name, color });
// //     await refresh();
// //   }, [refresh]);

// //   const addTodo = useCallback(async (categoryId: number, title: string, dateKey: string) => {
// //     await TodosAPI.createTodo({
// //       categoryId,
// //       content: title, // ✅ UI title -> 서버 content 매핑
// //       date: dateKey,
// //     });
// //     await refresh();
// //   }, [refresh]);

// //   const toggleTodo = useCallback(async (_categoryId: number, todoId: number) => {
// //     // 현재 state에서 완료값 찾아서 뒤집기
// //     let current = false;
// //     for (const c of categories) {
// //       const t = c.todos.find((x) => x.id === todoId);
// //       if (t) { current = t.completed; break; }
// //     }
// //     await TodosAPI.toggleTodoDone(todoId, !current);
// //     await refresh();
// //   }, [categories, refresh]);

// //   const deleteTodo = useCallback(async (todoId: number) => {
// //     await TodosAPI.deleteTodo(todoId);
// //     await refresh();
// //   }, [refresh]);

// //   // 정렬은 서버 반영 스펙이 없으니 UI에서만 처리
// //   const reorderCategory = useCallback((from: number, to: number) => {
// //     setCategories((prev) => {
// //       const arr = [...prev];
// //       const [moved] = arr.splice(from, 1);
// //       arr.splice(to, 0, moved);
// //       return arr;
// //     });
// //   }, []);

// //   const reorderTodo = useCallback((catId: number, from: number, to: number) => {
// //     setCategories((prev) =>
// //       prev.map((c) => {
// //         if (c.id !== catId) return c;
// //         const arr = [...c.todos];
// //         const [moved] = arr.splice(from, 1);
// //         arr.splice(to, 0, moved);
// //         return { ...c, todos: arr };
// //       })
// //     );
// //   }, []);

// //   const getDayStats = useCallback((dateKey: string) => {
// //     // 현재는 “선택 날짜 todos만” 로딩 중이라,
// //     // 달력의 다른 날짜 stats는 백엔드에 “월 단위 조회”가 있어야 정확해짐.
// //     // 우선 선택된 날짜만 stats 보장.
// //     if (dateKey !== selectedDateKey) return { total: 0, done: 0, left: 0, colors: [] };

// //     let total = 0;
// //     let done = 0;
// //     const colors: string[] = [];
// //     for (const c of categories) {
// //       const list = c.todos.filter((t) => t.date === dateKey);
// //       if (list.length) colors.push(c.color);
// //       total += list.length;
// //       done += list.filter((t) => t.completed).length;
// //     }
// //     return { total, done, left: total - done, colors };
// //   }, [categories, selectedDateKey]);

// //   const value = useMemo<Store>(() => ({
// //     selectedDateKey,
// //     setSelectedDateKey,
// //     categories,
// //     refresh,
// //     createCategory,
// //     addTodo,
// //     toggleTodo,
// //     deleteTodo,
// //     reorderCategory,
// //     reorderTodo,
// //     getDayStats,
// //   }), [selectedDateKey, categories, refresh, createCategory, addTodo, toggleTodo, deleteTodo, reorderCategory, reorderTodo, getDayStats]);

// //   return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
// // };

// // export function useCategories(): Store {
// //   const ctx = useContext(CategoriesContext);
// //   if (!ctx) throw new Error("useCategories must be used within <CategoriesProvider>");
// //   return ctx;
// // }
// // src/hooks/useCategories.tsx
// import React, { useCallback, useContext, useMemo, useState } from "react";
// import * as CategoriesAPI from "../api/categories";
// import * as TodosAPI from "../api/todos";

// // ===== 모델 =====
// export interface Category {
//   id: number;
//   name: string;
//   color: string;
//   order: number;
// }

// /**
//  * ✅ 백엔드 응답 기준 Todo 모델
//  * - content / done
//  * - categoryId + category_name + category_color
//  * - date/time
//  */
// export interface Todo {
//   id: number;
//   content: string;
//   date: string; // yyyy-MM-dd (프론트 표준)
//   time: string | null;
//   done: boolean;

//   categoryId: number;
//   category_name: string;
//   category_color: string;

//   memo?: string | null;
// }

// const k = (n: number) => String(n).padStart(2, "0");
// export const toKey = (d: Date) =>
//   `${d.getFullYear()}-${k(d.getMonth() + 1)}-${k(d.getDate())}`;

// // ✅ 백엔드에서 LocalDate가 [yyyy,mm,dd] 배열로 내려오는 케이스 대응
// const normalizeDate = (d: any): string => {
//   if (typeof d === "string") return d; // "2025-12-23"

//   if (Array.isArray(d) && d.length >= 3) {
//     const [y, m, day] = d;
//     const mm = String(m).padStart(2, "0");
//     const dd = String(day).padStart(2, "0");
//     return `${y}-${mm}-${dd}`;
//   }

//   return String(d);
// };

// // ===== store 타입 =====
// export type CategoryWithTodos = Category & { todos: Todo[] };

// type Store = {
  
//   selectedDateKey: string;
//   setSelectedDateKey: (k: string) => void;

//   categories: CategoryWithTodos[];

//   // 서버 동기화
//   refresh: () => Promise<void>;

//   createCategory: (name: string, color: string) => Promise<void>;

//   addTodo: (categoryId: number, title: string, dateKey: string) => Promise<void>;
//   toggleTodo: (categoryId: number, todoId: number) => Promise<void>;
//   deleteTodo: (todoId: number) => Promise<void>;

//   reorderCategory: (from: number, to: number) => void;
//   reorderTodo: (catId: number, from: number, to: number) => void;

//   getDayStats: (dateKey: string) => { total: number; done: number; left: number; colors: string[] };
  

// };

// const CategoriesContext = React.createContext<Store | null>(null);

// export const CategoriesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
//   const [selectedDateKey, setSelectedDateKey] = useState<string>(toKey(new Date()));
//   const [categories, setCategories] = useState<CategoryWithTodos[]>([]);

//   const buildCategories = useCallback((cats: Category[], todos: Todo[]) => {
//     const map = new Map<number, CategoryWithTodos>();
//     for (const c of cats) map.set(c.id, { ...c, todos: [] });

//     for (const t of todos) {
//       const owner = map.get(t.categoryId);
//       if (owner) owner.todos.push(t);
//     }

//     return Array.from(map.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//   }, []);

//   const refresh = useCallback(async () => {
//     const [cats, todos] = await Promise.all([
//       CategoriesAPI.getCategories(),
//       TodosAPI.getTodos({ date: selectedDateKey }),
//     ]);

//     const catModel: Category[] = cats.map((c) => ({
//       id: c.id,
//       name: c.name,
//       color: c.color,
//       order: c.order ?? 0,
//     }));

//     const todoModel: Todo[] = (todos as any[]).map((t) => {
//       // ✅ snake_case 응답(category_id) + camelCase(categoryId) 둘 다 대응
//       const categoryId: number = t.categoryId ?? t.category_id;

//       return {
//         id: t.id,
//         content: t.content,
//         date: normalizeDate(t.date), // ✅ [2025,12,23] -> "2025-12-23"
//         time: t.time ?? null,
//         done: t.done,

//         categoryId,
//         category_name: t.category_name,
//         category_color: t.category_color,

//         memo: t.memo ?? null,
//       };
//     });

//     setCategories(buildCategories(catModel, todoModel));
//   }, [selectedDateKey, buildCategories]);

//   const createCategory = useCallback(async (name: string, color: string) => {
//     await CategoriesAPI.createCategory({ name, color });
//     await refresh();
//   }, [refresh]);

//   const addTodo = useCallback(async (categoryId: number, title: string, dateKey: string) => {
//     await TodosAPI.createTodo({
//       categoryId,
//       content: title,
//       date: dateKey,
//     });
//     await refresh();
//   }, [refresh]);

//   const toggleTodo = useCallback(async (_categoryId: number, todoId: number) => {
//     let current = false;
//     for (const c of categories) {
//       const t = c.todos.find((x) => x.id === todoId);
//       if (t) { current = t.done; break; }
//     }
//     await TodosAPI.toggleTodoDone(todoId, !current);
//     await refresh();
//   }, [categories, refresh]);

//   const deleteTodo = useCallback(async (todoId: number) => {
//     await TodosAPI.deleteTodo(todoId);
//     await refresh();
//   }, [refresh]);

//   const reorderCategory = useCallback((from: number, to: number) => {
//     setCategories((prev) => {
//       const arr = [...prev];
//       const [moved] = arr.splice(from, 1);
//       arr.splice(to, 0, moved);
//       return arr;
//     });
//   }, []);

//   const reorderTodo = useCallback((catId: number, from: number, to: number) => {
//     setCategories((prev) =>
//       prev.map((c) => {
//         if (c.id !== catId) return c;
//         const arr = [...c.todos];
//         const [moved] = arr.splice(from, 1);
//         arr.splice(to, 0, moved);
//         return { ...c, todos: arr };
//       })
//     );
//   }, []);

//   const getDayStats = useCallback((dateKey: string) => {
//     if (dateKey !== selectedDateKey) return { total: 0, done: 0, left: 0, colors: [] };

//     let total = 0;
//     let done = 0;
//     const colors: string[] = [];

//     for (const c of categories) {
//       const list = c.todos.filter((t) => t.date === dateKey);
//       if (list.length) colors.push(c.color);
//       total += list.length;
//       done += list.filter((t) => t.done).length;
//     }

//     return { total, done, left: total - done, colors };
//   }, [categories, selectedDateKey]);

//   const value = useMemo<Store>(() => ({
//     selectedDateKey,
//     setSelectedDateKey,
//     categories,
//     refresh,
//     createCategory,
//     addTodo,
//     toggleTodo,
//     deleteTodo,
//     reorderCategory,
//     reorderTodo,
//     getDayStats,
//   }), [selectedDateKey, categories, refresh, createCategory, addTodo, toggleTodo, deleteTodo, reorderCategory, reorderTodo, getDayStats]);

//   return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
// };

// export function useCategories(): Store {
//   const ctx = useContext(CategoriesContext);
//   if (!ctx) throw new Error("useCategories must be used within <CategoriesProvider>");
//   return ctx;
// }
// src/hooks/useCategories.tsx
import React, { useCallback, useContext, useMemo, useState } from "react";
import * as CategoriesAPI from "../api/categories";
import * as TodosAPI from "../api/todos";

/* ================== 모델 ================== */
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

  memo?: string | null;
}

const k = (n: number) => String(n).padStart(2, "0");
export const toKey = (d: Date) =>
  `${d.getFullYear()}-${k(d.getMonth() + 1)}-${k(d.getDate())}`;

const normalizeDate = (d: any): string => {
  if (typeof d === "string") return d;
  if (Array.isArray(d)) {
    const [y, m, day] = d;
    return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return String(d);
};

/* ================== Store 타입 ================== */
export type CategoryWithTodos = Category & { todos: Todo[] };

type Store = {
  selectedDateKey: string;
  setSelectedDateKey: (k: string) => void;

  categories: CategoryWithTodos[];

  refresh: () => Promise<void>;

  createCategory: (name: string, color: string) => Promise<void>;
  updateCategory: (categoryId: number, payload: { name: string; color: string }) => Promise<void>;
  deleteCategory: (categoryId: number) => Promise<void>;

  addTodo: (categoryId: number, title: string, dateKey: string) => Promise<void>;
  toggleTodo: (categoryId: number, todoId: number) => Promise<void>;
  deleteTodo: (todoId: number) => Promise<void>;

  reorderCategory: (from: number, to: number) => void;
  reorderTodo: (catId: number, from: number, to: number) => void;

  getDayStats: (dateKey: string) => {
    total: number;
    done: number;
    left: number;
    colors: string[];
  };
};

const CategoriesContext = React.createContext<Store | null>(null);

/* ================== Provider ================== */
export const CategoriesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [selectedDateKey, setSelectedDateKey] = useState(toKey(new Date()));
  const [categories, setCategories] = useState<CategoryWithTodos[]>([]);

  const buildCategories = useCallback((cats: Category[], todos: Todo[]) => {
    const map = new Map<number, CategoryWithTodos>();
    cats.forEach((c) => map.set(c.id, { ...c, todos: [] }));
    todos.forEach((t) => map.get(t.categoryId)?.todos.push(t));
    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  }, []);

  const refresh = useCallback(async () => {
    const [cats, todos] = await Promise.all([
      CategoriesAPI.getCategories(),
      TodosAPI.getTodos({ date: selectedDateKey }),
    ]);

    const catModel: Category[] = cats.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      order: c.order ?? 0,
    }));

    const todoModel: Todo[] = todos.map((t: any) => ({
      id: t.id,
      content: t.content,
      date: normalizeDate(t.date),
      time: t.time ?? null,
      done: t.done,
      categoryId: t.categoryId ?? t.category_id,
      category_name: t.category_name,
      category_color: t.category_color,
      memo: t.memo ?? null,
    }));

    setCategories(buildCategories(catModel, todoModel));
  }, [selectedDateKey, buildCategories]);

  /* ================== Category ================== */
  const createCategory = useCallback(async (name: string, color: string) => {
    await CategoriesAPI.createCategory({ name, color });
    await refresh();
  }, [refresh]);

  const updateCategory = useCallback(
    async (categoryId: number, payload: { name: string; color: string }) => {
      await CategoriesAPI.updateCategory(categoryId, payload);
      await refresh();
    },
    [refresh]
  );

  const deleteCategory = useCallback(
    async (categoryId: number) => {
      await CategoriesAPI.deleteCategory(categoryId);
      await refresh();
    },
    [refresh]
  );

  /* ================== Todo ================== */
  const addTodo = useCallback(async (categoryId: number, title: string, dateKey: string) => {
    await TodosAPI.createTodo({ categoryId, content: title, date: dateKey });
    await refresh();
  }, [refresh]);

  const toggleTodo = useCallback(async (_cid: number, todoId: number) => {
    let current = false;
    categories.forEach((c) => {
      const t = c.todos.find((x) => x.id === todoId);
      if (t) current = t.done;
    });
    await TodosAPI.toggleTodoDone(todoId, !current);
    await refresh();
  }, [categories, refresh]);

  const deleteTodo = useCallback(async (todoId: number) => {
    await TodosAPI.deleteTodo(todoId);
    await refresh();
  }, [refresh]);

  /* ================== UI 전용 ================== */
  const reorderCategory = useCallback((from: number, to: number) => {
    setCategories((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  }, []);

  const reorderTodo = useCallback((catId: number, from: number, to: number) => {
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

  const getDayStats = useCallback((dateKey: string) => {
    if (dateKey !== selectedDateKey) return { total: 0, done: 0, left: 0, colors: [] };
    let total = 0, done = 0;
    const colors: string[] = [];
    categories.forEach((c) => {
      const list = c.todos.filter((t) => t.date === dateKey);
      if (list.length) colors.push(c.color);
      total += list.length;
      done += list.filter((t) => t.done).length;
    });
    return { total, done, left: total - done, colors };
  }, [categories, selectedDateKey]);

  const value = useMemo<Store>(() => ({
    selectedDateKey,
    setSelectedDateKey,
    categories,
    refresh,
    createCategory,
    updateCategory,
    deleteCategory,
    addTodo,
    toggleTodo,
    deleteTodo,
    reorderCategory,
    reorderTodo,
    getDayStats,
  }), [
    selectedDateKey, categories, refresh,
    createCategory, updateCategory, deleteCategory,
    addTodo, toggleTodo, deleteTodo,
    reorderCategory, reorderTodo, getDayStats,
  ]);

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
};

export function useCategories(): Store {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error("useCategories must be used within <CategoriesProvider>");
  return ctx;
}
