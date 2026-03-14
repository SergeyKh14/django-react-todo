import { api } from "./api";
import type {
  Board,
  BoardListResponse,
  CreateBoardPayload,
  UpdateBoardPayload,
} from "@/types/board";
import type { Task, TaskSummary } from "@/types/task";

export type { CreateBoardPayload, UpdateBoardPayload } from "@/types/board";

export const boardService = {
  getTaskSummary: async (): Promise<TaskSummary> => {
    const { data } = await api.get<TaskSummary>("/boards/task-summary/");
    return data;
  },

  getList: async (params?: { page?: number; page_size?: number }) => {
    const { data } = await api.get<BoardListResponse>("/boards/", { params });
    return data;
  },

  getOne: async (id: string) => {
    const { data } = await api.get<Board>(`/boards/${id}/`);
    return data;
  },

  getTasks: async (boardId: string) => {
    const { data } = await api.get<Task[]>(`/boards/${boardId}/tasks/`);
    return data;
  },

  create: async (payload: CreateBoardPayload) => {
    const { data } = await api.post<Board>("/boards/", payload);
    return data;
  },

  update: async (id: string, payload: UpdateBoardPayload) => {
    const { data } = await api.patch<Board>(`/boards/${id}/`, payload);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/boards/${id}/`);
  },
};
