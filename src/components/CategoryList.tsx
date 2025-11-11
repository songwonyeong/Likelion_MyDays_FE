// src/components/CategoryList.tsx
import type { Category } from "../hooks/useCategories";
import CategoryCard from "./CategoryCard";

type Props = {
  dateKey: string;
  categories: Category[];
  addTodo: (catId: string, title: string) => void; // dateKey는 Main이 주입
  toggleTodo: (catId: string, todoId: string) => void;
  reorderCategory: (from: number, to: number) => void;
  reorderTodo: (catId: string, from: number, to: number) => void;
};

export default function CategoryList({
  dateKey,
  categories,
  addTodo,
  toggleTodo,
  reorderCategory,
  reorderTodo,
}: Props) {
  const filtered = categories.map((c) => ({
    ...c,
    todos: c.todos.filter((t) => t.dateKey === dateKey),
  }));

  return (
    <div className="space-y-4 sticky top-4">
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
  );
}
