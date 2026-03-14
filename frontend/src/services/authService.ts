import { api } from "./api";
import type {
  User,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "@/types/user";

export type { LoginPayload, RegisterPayload, AuthResponse } from "@/types/user";

export const authService = {
  login: async (data: LoginPayload) => {
    const { data: res } = await api.post<AuthResponse>("/auth/login/", data);
    return res;
  },
  register: async (data: RegisterPayload) => {
    const { data: res } = await api.post<AuthResponse>("/auth/register/", data);
    return res;
  },
  getMe: async () => {
    const { data } = await api.get<User>("/auth/me/");
    return data;
  },
  updateMe: async (data: { first_name?: string; last_name?: string }) => {
    const { data: user } = await api.patch<User>("/auth/me/", data);
    return user;
  },
};
