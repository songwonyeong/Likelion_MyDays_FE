// src/components/TodoItem.tsx
import React from "react";
import type { Todo } from "../hooks/useCategories";

type Props = {
  todo: Todo;
  index: number;
  categoryId: string;
  categoryColor: string;
  onToggle: (todoId: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
};

export default function TodoItem({
  todo,
  index,
  categoryColor,
  onToggle,
  onDragStart,
  onDragOver,
  onDrop,
}: Props) {
  return (
    <li
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2"
      style={{ background: todo.done ? `${categoryColor}10` : "#fff" }}
    >
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle(todo.id)}
          className="w-4 h-4"
        />
        <span className={todo.done ? "line-through text-gray-400" : ""}>
          {todo.title}
        </span>
      </label>
      <span className="text-xs text-gray-400">{todo.dateKey}</span>
    </li>
  );
}
