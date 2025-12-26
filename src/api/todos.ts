// src/api/todos.ts
import { apiClient } from "../lib/apiClient";

export interface TodoResp {
  id: number;

  // 응답은 백엔드가 snake_case로 내려주지만,
  // TodoController.toResp()에서 categoryId는 그대로 categoryId로 내려주고 있음(현재 코드 기준)
  categoryId?: number;
  category_id?: number;
  category_name: string;
  category_color: string;

  content: string;
  done: boolean;

  date: string;        // yyyy-MM-dd
  time: string | null; // HH:mm or null
}

/**
 * 날짜별 할 일 조회
 * - 백엔드가 date 필수라서, date 없으면 요청 자체를 안 보냄(빈 배열 반환)
 */
export async function getTodos(params?: { date?: string }) {
  if (!params?.date) return [];
  const { data } = await apiClient.get<TodoResp[]>("/api/todos", { params });
  return data;
}

export interface CreateTodoBody {
  categoryId: number;
  content: string;
  date: string;         // yyyy-MM-dd
  time?: string | null; // HH:mm or null
  done?: boolean;
}

/**
 * 할 일 생성
 * ✅ 백엔드 ObjectMapper가 SNAKE_CASE라서 요청 바디는 snake_case로 보내야 함
 * - categoryId -> category_id
 */
export async function createTodo(body: CreateTodoBody) {
  const payload = {
    category_id: body.categoryId,     // 🔥 핵심
    content: body.content,
    date: body.date,
    time: body.time ?? null,
    done: body.done ?? false,
  };

  const { data } = await apiClient.post<TodoResp>("/api/todos", payload);
  return data;
}

/**
 * 완료 토글
 * ✅ 요청 바디는 snake_case 영향이 없지만(done은 동일),
 * 그래도 전역 전략 통일 관점에서 payload 명확히 유지
 */
export async function toggleTodoDone(id: number, done: boolean) {
  const { data } = await apiClient.patch<TodoResp>(`/api/todos/${id}/done`, { done });
  return data;
}

export async function deleteTodo(id: number) {
  await apiClient.delete(`/api/todos/${id}`);
}


// // src/api/todos.ts
// import { apiClient } from "../lib/apiClient";

// // ✅ 백엔드 응답이 categoryId만 주는 형태라면 이 타입이 맞고
// // 만약 백엔드가 category 객체까지 주면 아래를 바꿔야 함.
// export interface TodoResp {
//   id: number;
//   content: string;        // ✅ title ❌ content ✅
//   memo: string | null;
//   date: string;           // yyyy-MM-dd
//   time: string | null;    // HH:mm or null
//   completed: boolean;
//   categoryId: number;
// }

// export async function getTodos(params?: { date?: string }) {
//   const { data } = await apiClient.get<TodoResp[]>("/api/todos", { params });
//   return data;
// }

// export async function createTodo(body: {
//   categoryId: number;
//   content: string;
//   memo?: string | null;
//   date: string;
//   time?: string | null;
// }) {
//   const { data } = await apiClient.post<TodoResp>("/api/todos", body);
//   return data;
// }

// // ✅ 완료 토글: PATCH /api/todos/{id}/complete  + { completed: boolean }
// export async function toggleTodoComplete(id: number, completed: boolean) {
//   const { data } = await apiClient.patch<{ id?: number; completed?: boolean }>(
//     `/api/todos/${id}/complete`,
//     { completed }
//   );
//   return data;
// }

// export async function deleteTodo(id: number) {
//   await apiClient.delete(`/api/todos/${id}`);
// }
