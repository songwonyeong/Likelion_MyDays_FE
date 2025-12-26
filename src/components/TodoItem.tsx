// src/components/TodoItem.tsx
import React from "react";
import type { Todo } from "../hooks/useCategories";

type Props = {
  todo: Todo;
  index: number;
  categoryId: number;
  categoryColor: string;
  onToggle: (todoId: number) => void;
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
      style={{ background: todo.done ? `${categoryColor}10` : "#fff" }} // ✅ completed -> done
    >
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={todo.done} // ✅ completed -> done
          onChange={() => onToggle(todo.id)}
          className="w-4 h-4 rounded-md border border-gray-300 bg-white accent-black focus:ring-0"
        />
        <span className={todo.done ? "line-through text-gray-400" : "text-gray-900"}>
          {todo.content} {/* ✅ title -> content */}
        </span>
      </label>

      {/* date는 yyyy-MM-dd */}
      <span className="text-xs text-gray-400">{todo.date}</span>
    </li>
  );
}
