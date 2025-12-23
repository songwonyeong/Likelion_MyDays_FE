// src/components/MainTopBar.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import { apiClient } from "../lib/apiClient";
import { useCategories } from "../hooks/useCategories";
import { clearAccessToken, setAccessToken } from "../lib/tokenStore";

type Props = { title?: string };

type CategoryDto = {
  id: number;
  name: string;
  color: string;
};

type UserInfo = {
  name?: string;
  email?: string;
  provider?: "LOCAL" | "KAKAO" | string;
};

export default function MainTopBar({ title = "MyDays" }: Props) {
  const nav = useNavigate();
  const store = useCategories();

  const [openMenu, setOpenMenu] = useState(false);
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [openMeModal, setOpenMeModal] = useState(false);

  // ✅ 카테고리 모달
  const [openCreateCat, setOpenCreateCat] = useState(false);
  const [openManageCat, setOpenManageCat] = useState(false);

  // 내정보(일단 임시)
  const [me] = useState<UserInfo>({
    name: "사용자",
    email: "user@example.com",
    provider: "LOCAL",
  });

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpenMenu(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const isAnyModalOpen =
      openLogoutModal || openMeModal || openCreateCat || openManageCat;
    if (isAnyModalOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openLogoutModal, openMeModal, openCreateCat, openManageCat]);

  const requestLogout = () => {
    setOpenMenu(false);
    setOpenLogoutModal(true);
  };

  const openMe = () => {
    setOpenMenu(false);
    setOpenMeModal(true);
  };

  const openCreateCategory = () => {
    setOpenMenu(false);
    setOpenCreateCat(true);
  };

  const openManageCategory = () => {
    setOpenMenu(false);
    setOpenManageCat(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    } finally {
      clearAccessToken();
      setOpenLogoutModal(false);
      nav("/", { replace: true });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-gray-50">
        <div className="relative max-w-[1180px] mx-auto h-16 px-4 flex items-center justify-between">
          <div className="w-11" />

          <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-4xl tracking-tight text-gray-900">
            {title}
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpenMenu((v) => !v)}
              className="
                w-11 h-11 rounded-2xl
                bg-white text-black
                border border-gray-200
                shadow-sm
                flex items-center justify-center
                hover:bg-gray-100
                transition-colors
              "
              aria-label="메뉴 열기"
            >
              <span className="text-2xl leading-none">+</span>
            </button>

            {openMenu && (
              <div
                className="
                  absolute right-0 mt-3 w-60
                  rounded-2xl bg-white
                  border border-gray-200
                  shadow-lg overflow-hidden
                "
              >
                <MenuItem label="카테고리 등록" onClick={openCreateCategory} />
                <MenuItem label="카테고리 관리" onClick={openManageCategory} />
                <MenuItem
                  label="AI 할일 생성"
                  onClick={() => {
                    setOpenMenu(false);
                    alert("AI 할일 생성은 아직 연결 전");
                  }}
                />
                <MenuItem label="내 정보" onClick={openMe} />
                <div className="h-px bg-gray-100" />
                <MenuItem label="로그아웃" danger onClick={requestLogout} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ✅ 카테고리 생성 모달 */}
      <CreateCategoryModal
        open={openCreateCat}
        onClose={() => setOpenCreateCat(false)}
        onCreated={async () => {
          await store.refresh();
        }}
      />

      {/* ✅ 카테고리 관리 모달 */}
      <ManageCategoryModal
        open={openManageCat}
        onClose={() => setOpenManageCat(false)}
        onChanged={async () => {
          await store.refresh();
        }}
      />

      {/* 로그아웃 확인 모달 */}
      <CenterModal
        open={openLogoutModal}
        title="로그아웃"
        onClose={() => setOpenLogoutModal(false)}
      >
        <p className="text-sm text-gray-700">로그아웃 하시겠습니까?</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpenLogoutModal(false)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={confirmLogout}
            className="px-3 py-2 rounded-xl bg-gray-900 text-white hover:bg-black"
          >
            로그아웃
          </button>
        </div>
      </CenterModal>

      {/* 내 정보 모달 */}
      <CenterModal
        open={openMeModal}
        title="내 정보"
        onClose={() => setOpenMeModal(false)}
      >
        <div className="space-y-3">
          <InfoRow label="이름" value={me.name ?? "-"} />
          <InfoRow label="이메일" value={me.email ?? "-"} />
          <InfoRow label="로그인 방식" value={me.provider ?? "-"} />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setOpenMeModal(false)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
          >
            닫기
          </button>
        </div>
      </CenterModal>
    </>
  );
}

function MenuItem({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left px-4 py-3 text-sm font-medium transition-colors",
        "bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100",
        danger ? "text-red-600 hover:bg-red-50 active:bg-red-100" : "",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}

function CenterModal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-[520px] rounded-2xl bg-white border border-gray-200 shadow-xl p-5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

/** =========================
 *  카테고리 생성 모달
 *  - POST /api/categories
 * ========================= */
function CreateCategoryModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#4CAF50");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  if (!open) return null;

  const submit = async () => {
    if (!name.trim()) {
      setErr("카테고리 이름을 입력하세요.");
      return;
    }

    setLoading(true);
    setErr("");

    try {
      await apiClient.post("/api/categories", { name: name.trim(), color });
      await onCreated();
      setName("");
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "카테고리 생성 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CenterModal open={open} title="카테고리 등록" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <div className="text-sm font-semibold mb-1">이름</div>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErr("");
            }}
            className="w-full rounded-xl border border-gray-200 px-3 py-2"
            placeholder="예) 공부"
          />
        </div>

        <div>
          <div className="text-sm font-semibold mb-1">색상</div>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-16 h-10 p-1 rounded-lg border border-gray-200"
          />
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            className="px-3 py-2 rounded-xl bg-gray-900 text-white hover:bg-black"
            disabled={loading}
          >
            {loading ? "등록 중..." : "등록"}
          </button>
        </div>
      </div>
    </CenterModal>
  );
}

/** =========================
 *  카테고리 관리 모달
 *  - GET /api/categories
 *  - PUT /api/categories/{id}
 *  - DELETE /api/categories/{id}
 * ========================= */
function ManageCategoryModal({
  open,
  onClose,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const [items, setItems] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await apiClient.get<CategoryDto[]>("/api/categories");
      setItems(data ?? []);
    } catch (e: any) {
      setErr(e?.message ?? "카테고리 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const updateOne = async (id: number, name: string, color: string) => {
    await apiClient.put(`/api/categories/${id}`, { name, color });
    await onChanged();
    await load();
  };

  const deleteOne = async (id: number) => {
    await apiClient.delete(`/api/categories/${id}`);
    await onChanged();
    await load();
  };

  return (
    <CenterModal open={open} title="카테고리 관리" onClose={onClose}>
      {loading && <div className="text-sm text-gray-600">불러오는 중...</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}

      <div className="space-y-2">
        {items.map((c) => (
          <CategoryRow
            key={c.id}
            cat={c}
            onSave={updateOne}
            onDelete={deleteOne}
          />
        ))}
        {!loading && items.length === 0 && (
          <div className="text-sm text-gray-600">카테고리가 없습니다.</div>
        )}
      </div>

      <div className="flex justify-end pt-3">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
        >
          닫기
        </button>
      </div>
    </CenterModal>
  );
}

function CategoryRow({
  cat,
  onSave,
  onDelete,
}: {
  cat: CategoryDto;
  onSave: (id: number, name: string, color: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [name, setName] = useState(cat.name);
  const [color, setColor] = useState(cat.color);
  const [busy, setBusy] = useState(false);

  const dirty = name !== cat.name || color !== cat.color;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-sm"
      />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-10 h-9 p-1 rounded-lg border border-gray-200"
      />

      <button
        type="button"
        disabled={!dirty || busy}
        onClick={async () => {
          if (!name.trim()) return;
          setBusy(true);
          try {
            await onSave(cat.id, name.trim(), color);
          } finally {
            setBusy(false);
          }
        }}
        className={[
          "px-3 py-1.5 rounded-lg text-sm border",
          dirty ? "bg-gray-900 text-white border-gray-900" : "bg-gray-100 text-gray-400 border-gray-200",
        ].join(" ")}
      >
        저장
      </button>

      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          if (!confirm("삭제할까요?")) return;
          setBusy(true);
          try {
            await onDelete(cat.id);
          } finally {
            setBusy(false);
          }
        }}
        className="px-3 py-1.5 rounded-lg text-sm border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
      >
        삭제
      </button>
    </div>
  );
}
