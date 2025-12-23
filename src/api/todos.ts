// src/api/todos.ts
import { apiClient } from "../lib/apiClient";

// ✅ 백엔드 응답이 categoryId만 주는 형태라면 이 타입이 맞고
// 만약 백엔드가 category 객체까지 주면 아래를 바꿔야 함.
export interface TodoResp {
  id: number;
  content: string;        // ✅ title ❌ content ✅
  memo: string | null;
  date: string;           // yyyy-MM-dd
  time: string | null;    // HH:mm or null
  completed: boolean;
  categoryId: number;
}

export async function getTodos(params?: { date?: string }) {
  const { data } = await apiClient.get<TodoResp[]>("/api/todos", { params });
  return data;
}

export async function createTodo(body: {
  categoryId: number;
  content: string;
  memo?: string | null;
  date: string;
  time?: string | null;
}) {
  const { data } = await apiClient.post<TodoResp>("/api/todos", body);
  return data;
}

// ✅ 완료 토글: PATCH /api/todos/{id}/complete  + { completed: boolean }
export async function toggleTodoComplete(id: number, completed: boolean) {
  const { data } = await apiClient.patch<{ id?: number; completed?: boolean }>(
    `/api/todos/${id}/complete`,
    { completed }
  );
  return data;
}

export async function deleteTodo(id: number) {
  await apiClient.delete(`/api/todos/${id}`);
}
