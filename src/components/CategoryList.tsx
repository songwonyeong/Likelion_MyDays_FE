// src/components/CategoryList.tsx
import type { CategoryWithTodos } from "../hooks/useCategories";
import CategoryCard from "./CategoryCard";

type Props = {
  dateKey: string;
  categories: CategoryWithTodos[];
  addTodo: (catId: number, title: string) => void;
  toggleTodo: (catId: number, todoId: number) => void;
  reorderCategory: (from: number, to: number) => void;
  reorderTodo: (catId: number, from: number, to: number) => void;
};

export default function CategoryList({
  dateKey,
  categories,
  addTodo,
  toggleTodo,
  reorderCategory,
  reorderTodo,
}: Props) {
  // ✅ 더 이상 날짜로 필터링하지 않음
  const filtered = categories;
 
  return (
    <div className="sticky top-4">
      <div className="mb-3 px-1">
        <div className="text-xs text-gray-500">선택한 날짜</div>
        <div className="text-sm font-semibold text-gray-900">{dateKey}</div>
      </div>

      <div key={dateKey} className="space-y-3 animate-[fadeIn_.18s_ease-out]">
        {filtered.map((c, idx) => (
          <CategoryCard
            key={c.id}
            category={c}
            index={idx}
            dateKey={dateKey}
            onReorderCategory={reorderCategory}
            onAddTodo={addTodo}
            onToggleTodo={toggleTodo}
            onReorderTodo={reorderTodo}
          />
        ))}
      </div>
    </div>
  );
}
