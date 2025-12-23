// src/api/categories.ts
import { apiClient } from "../lib/apiClient";

export type CategoryResp = {
  id: number;
  name: string;
  color: string;
  order?: number; // 백엔드가 안 줄 수도 있음
};

export async function getCategories() {
  const { data } = await apiClient.get<CategoryResp[]>("/api/categories");
  // order가 없을 수 있으니 기본값 보정(프론트 정렬용)
  return data.map((c, idx) => ({
    ...c,
    order: c.order ?? idx,
  }));
}

export async function createCategory(body: { name: string; color: string }) {
  const { data } = await apiClient.post<CategoryResp>("/api/categories", body);
  return data;
}

export async function updateCategory(
  categoryId: number,
  body: { name: string; color: string }
) {
  const { data } = await apiClient.put<CategoryResp>(
    `/api/categories/${categoryId}`,
    body
  );
  return data;
}

export async function deleteCategory(categoryId: number) {
  await apiClient.delete(`/api/categories/${categoryId}`);
}
