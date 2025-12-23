// src/components/TodoCard.tsx
import React from "react";
import type { CategoryWithTodos } from "../hooks/useCategories";
import CategoryCard from "./CategoryCard";

type Props = {
  category: CategoryWithTodos;
  index: number;
  dateKey: string;
  onReorderCategory: (from: number, to: number) => void;
  onAddTodo: (catId: number, title: string) => void;
  onToggleTodo: (catId: number, todoId: number) => void;
  onReorderTodo: (catId: number, from: number, to: number) => void;
};

export default function TodoCard({
  category,
  index,
  dateKey,
  onReorderCategory,
  onAddTodo,
  onToggleTodo,
  onReorderTodo,
}: Props) {
  return (
    <CategoryCard
      category={category}
      index={index}
      dateKey={dateKey}
      onReorderCategory={onReorderCategory}
      onAddTodo={onAddTodo}
      onToggleTodo={onToggleTodo}
      onReorderTodo={onReorderTodo}
    />
  );
}
