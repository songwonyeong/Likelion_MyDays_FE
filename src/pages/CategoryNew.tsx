// src/pages/CategoryNew.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";

export default function CategoryNew() {
  const nav = useNavigate();
  const { createCategory } = useCategories();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#7c3aed");

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: 16 }}>
      <h1 className="text-xl font-extrabold mb-4">카테고리 등록</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">카테고리 이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="예) 급한 업무"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">색상</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 border rounded"
            />
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder="#7c3aed"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => nav(-1)}
            className="border px-4 py-2 rounded-lg"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => {
              if (!name.trim()) return;
              createCategory(name.trim(), color);
              nav("/main"); // ✅ 메인 페이지로 이동
            }}
            className="border px-4 py-2 rounded-lg bg-black text-white"
          >
            생성
          </button>
        </div>
      </div>
    </div>
  );
}
