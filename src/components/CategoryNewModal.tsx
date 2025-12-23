// src/components/CategoryNewModal.tsx
import { useEffect, useState } from "react";
import { useCategories } from "../hooks/useCategories";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CategoryNewModal({ open, onClose }: Props) {
  const { createCategory } = useCategories();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#7c3aed");

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (!open) return;
    setName("");
    setColor("#7c3aed");
  }, [open]);

  // ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = () => {
    if (!name.trim()) return;
    createCategory(name.trim(), color);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden
      />

      {/* modal card */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-[520px] rounded-2xl bg-white shadow-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-gray-900">
              카테고리 등록
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-700">
                카테고리 이름
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                placeholder="예) 급한 업무"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-700">색상</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200"
                />
                <input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="#7c3aed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800"
              >
                취소
              </button>
              <button
                type="button"
                onClick={submit}
                className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-900"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
