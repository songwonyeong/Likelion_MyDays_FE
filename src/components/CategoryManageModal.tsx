// // src/components/CategoryManageModal.tsx
// import { useEffect, useMemo, useState } from "react";
// import { useCategories } from "../hooks/useCategories";

// type Props = {
//   open: boolean;
//   onClose: () => void;
// };

// export default function CategoryManageModal({ open, onClose }: Props) {
//   const { categories, updateCategory, deleteCategory, reorderCategory } = useCategories();

//   // 편집용 로컬 상태(입력 중 즉시 반영)
//   const [draft, setDraft] = useState(() =>
//     categories.map((c) => ({ id: c.id, name: c.name, color: c.color }))
//   );

//   // 모달 열릴 때 스냅샷 갱신
//   useEffect(() => {
//     if (!open) return;
//     setDraft(categories.map((c) => ({ id: c.id, name: c.name, color: c.color })));
//   }, [open, categories]);

//   // ESC 닫기
//   useEffect(() => {
//     if (!open) return;
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [open, onClose]);

//   const byId = useMemo(() => new Map(draft.map((d) => [d.id, d])), [draft]);

//   if (!open) return null;

//   const commitOne = (catId: string) => {
//     const d = byId.get(catId);
//     if (!d) return;
//     updateCategory(catId, { name: d.name.trim() || "카테고리", color: d.color });
//   };

//   const move = (from: number, to: number) => {
//     if (to < 0 || to >= categories.length) return;
//     // store 정렬
//     reorderCategory(from, to);
//   };

//   return (
//     <div className="fixed inset-0 z-[110]">
//       <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
//       <div className="absolute inset-0 flex items-center justify-center p-4">
//         <div className="w-full max-w-[640px] rounded-2xl bg-white shadow-xl border border-gray-200 p-5">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-extrabold text-gray-900">카테고리 관리</h2>
//             <button
//               type="button"
//               onClick={onClose}
//               className="w-9 h-9 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
//               aria-label="닫기"
//             >
//               ✕
//             </button>
//           </div>

//           {categories.length === 0 ? (
//             <div className="text-sm text-gray-500 py-10 text-center">
//               카테고리가 없습니다. “카테고리 등록”에서 추가해줘.
//             </div>
//           ) : (
//             <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
//               {categories.map((c, idx) => {
//                 const d = byId.get(c.id)!;
//                 return (
//                   <div
//                     key={c.id}
//                     className="rounded-2xl border border-gray-200 bg-white p-4 flex items-center gap-3"
//                   >
//                     {/* 색상 */}
//                     <input
//                       type="color"
//                       value={d.color}
//                       onChange={(e) =>
//                         setDraft((prev) =>
//                           prev.map((x) => (x.id === c.id ? { ...x, color: e.target.value } : x))
//                         )
//                       }
//                       className="w-10 h-10 rounded-lg border border-gray-200"
//                       title="색상"
//                     />

//                     {/* 이름 */}
//                     <input
//                       value={d.name}
//                       onChange={(e) =>
//                         setDraft((prev) =>
//                           prev.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x))
//                         )
//                       }
//                       className="flex-1 rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
//                       placeholder="카테고리 이름"
//                     />

//                     {/* 저장 */}
//                     <button
//                       type="button"
//                       onClick={() => commitOne(c.id)}
//                       className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium"
//                     >
//                       저장
//                     </button>

//                     {/* 순서 */}
//                     <div className="flex items-center gap-1">
//                       <button
//                         type="button"
//                         onClick={() => move(idx, idx - 1)}
//                         className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
//                         aria-label="위로"
//                       >
//                         ↑
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => move(idx, idx + 1)}
//                         className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
//                         aria-label="아래로"
//                       >
//                         ↓
//                       </button>
//                     </div>

//                     {/* 삭제 */}
//                     <button
//                       type="button"
//                       onClick={() => {
//                         const ok = confirm(`"${c.name}" 카테고리를 삭제할까?\n(해당 카테고리의 할일도 함께 사라져)`);
//                         if (!ok) return;
//                         deleteCategory(c.id);
//                       }}
//                       className="px-3 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-sm font-semibold"
//                     >
//                       삭제
//                     </button>
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           <div className="flex justify-end pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-900"
//             >
//               닫기
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// src/components/CategoryManageModal.tsx
import { useEffect, useMemo, useState } from "react";
import { useCategories } from "../hooks/useCategories";

type Props = {
  open: boolean;
  onClose: () => void;
};

type DraftCategory = {
  id: number;
  name: string;
  color: string;
};

export default function CategoryManageModal({ open, onClose }: Props) {
  const { categories, updateCategory, deleteCategory, reorderCategory } = useCategories();

  // 편집용 로컬 상태(입력 중 즉시 반영)
  const [draft, setDraft] = useState<DraftCategory[]>(() =>
    categories.map((c) => ({ id: c.id, name: c.name, color: c.color }))
  );

  // 모달 열릴 때 스냅샷 갱신
  useEffect(() => {
    if (!open) return;
    setDraft(categories.map((c) => ({ id: c.id, name: c.name, color: c.color })));
  }, [open, categories]);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const byId = useMemo(() => new Map<number, DraftCategory>(draft.map((d) => [d.id, d])), [draft]);

  if (!open) return null;

  // ✅ 여기만 number로 바꾸면 에러 3개가 한 번에 해결됨
  const commitOne = (catId: number) => {
    const d = byId.get(catId);
    if (!d) return;
    updateCategory(catId, { name: d.name.trim() || "카테고리", color: d.color });
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= categories.length) return;
    reorderCategory(from, to);
  };

  return (
    <div className="fixed inset-0 z-[110]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-[640px] rounded-2xl bg-white shadow-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-gray-900">카테고리 관리</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="text-sm text-gray-500 py-10 text-center">
              카테고리가 없습니다. “카테고리 등록”에서 추가해줘.
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
              {categories.map((c, idx) => {
                const d = byId.get(c.id)!;
                return (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-gray-200 bg-white p-4 flex items-center gap-3"
                  >
                    <input
                      type="color"
                      value={d.color}
                      onChange={(e) =>
                        setDraft((prev) =>
                          prev.map((x) => (x.id === c.id ? { ...x, color: e.target.value } : x))
                        )
                      }
                      className="w-10 h-10 rounded-lg border border-gray-200"
                      title="색상"
                    />

                    <input
                      value={d.name}
                      onChange={(e) =>
                        setDraft((prev) =>
                          prev.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x))
                        )
                      }
                      className="flex-1 rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                      placeholder="카테고리 이름"
                    />

                    <button
                      type="button"
                      onClick={() => commitOne(c.id)}
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium"
                    >
                      저장
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => move(idx, idx - 1)}
                        className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                        aria-label="위로"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(idx, idx + 1)}
                        className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                        aria-label="아래로"
                      >
                        ↓
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const ok = confirm(`"${c.name}" 카테고리를 삭제할까?\n(해당 카테고리의 할일도 함께 사라져)`);
                        if (!ok) return;
                        deleteCategory(c.id);
                      }}
                      className="px-3 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-sm font-semibold"
                    >
                      삭제
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-900"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
