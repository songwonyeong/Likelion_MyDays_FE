// src/components/CategoryCard.tsx
import React, { useRef, useState } from "react";
import TodoItem from "./TodoItem";
import type { CategoryWithTodos } from "../hooks/useCategories";

type Props = {
  category: CategoryWithTodos;
  index: number;
  dateKey: string;
  onReorderCategory: (fromIdx: number, toIdx: number) => void;
  onAddTodo: (catId: number, title: string) => void;
  onToggleTodo: (catId: number, todoId: number) => void;
  onReorderTodo: (catId: number, from: number, to: number) => void;
};

export default function CategoryCard({
  category,
  index,
  dateKey,
  onReorderCategory,
  onAddTodo,
  onToggleTodo,
  onReorderTodo,
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/categoryIndex", String(index));
  };

  const onDrop = (e: React.DragEvent) => {
    const from = Number(e.dataTransfer.getData("text/categoryIndex"));
    if (!Number.isNaN(from) && from !== index) onReorderCategory(from, index);
  };

  return (
    <div
      ref={ref}
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="border border-gray-200 bg-white rounded-[14px] p-4 shadow-[0_6px_18px_rgba(17,24,39,0.06)]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-[15px] font-extrabold tracking-tight"
            style={{ color: category.color }}
          >
            {category.name}
          </span>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="
            w-9 h-9 inline-flex items-center justify-center
            rounded-xl bg-white text-black
            border border-gray-200 shadow-sm
            hover:bg-gray-50 active:bg-gray-100
            transition-colors
          "
          title="할 일 추가"
          aria-label="할 일 추가"
        >
          +
        </button>
      </div>

      <ul className="space-y-2">
        {category.todos.map((todo, i) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            index={i}
            categoryId={category.id}
            categoryColor={category.color}
            onToggle={(todoId) => onToggleTodo(category.id, todoId)}
            onDragStart={(ev, idx) => {
              ev.dataTransfer.setData("text/categoryId", String(category.id));
              ev.dataTransfer.setData("text/todoIndex", String(idx));
            }}
            onDragOver={(ev) => ev.preventDefault()}
            onDrop={(ev, idx) => {
              const fromIdx = Number(ev.dataTransfer.getData("text/todoIndex"));
              const owner = Number(ev.dataTransfer.getData("text/categoryId"));
              if (!Number.isNaN(fromIdx) && owner === category.id) {
                onReorderTodo(category.id, fromIdx, idx);
              }
            }}
          />
        ))}
      </ul>

      {/* 모달 */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-4 w-[420px] border border-gray-200 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-extrabold mb-3">할 일 추가</h3>
            <p className="text-xs text-gray-500 mb-2">등록 날짜: {dateKey}</p>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`예) ${category.name} 할 일`}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              >
                취소
              </button>

              <button
                onClick={() => {
                  if (!title.trim()) return;
                  onAddTodo(category.id, title.trim());
                  setTitle("");
                  setOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-black hover:bg-gray-50 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
