import axios from "axios";
import type { RootState } from "@/store";
import { store } from "@/store";
import { logout } from "@/store/authSlice";
import { queryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";

export const API_BASE =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const state = store.getState() as RootState;
  const token = state.auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      queryClient.removeQueries({ queryKey: queryKeys.auth.me() });
      store.dispatch(logout());
    }
    return Promise.reject(error);
  },
);
