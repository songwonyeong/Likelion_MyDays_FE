// src/components/TopRightMenu.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TopRightMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 border rounded-lg font-bold"
        title="메뉴"
      >
        ...
      </button>

      {open && (
        <div
          className="bg-white border rounded-xl shadow-lg"
          style={{
            position: "absolute",
            right: 0,
            top: "110%",
            width: 260,
            padding: 8,
            zIndex: 50,
          }}
        >
          <div className="flex items-center justify-between px-3 py-2 font-semibold">
            <span>카테고리 등록</span>
            <button
              className="w-7 h-7 border rounded-lg"
              onClick={() => {
                setOpen(false);
                nav("/category/new");
              }}
              title="새 카테고리"
            >
              +
            </button>
          </div>

          <div className="h-px bg-gray-100 my-1" />
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50">
            AI 할 일 생성
          </button>
          <div className="h-px bg-gray-100 my-1" />
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50">
            카테고리 관리
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50">
            루틴 관리
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50">
            리마인더 관리
          </button>
        </div>
      )}
    </div>
  );
}
