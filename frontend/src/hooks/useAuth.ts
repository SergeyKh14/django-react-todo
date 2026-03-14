import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RootState } from "@/store";
import { logout as logoutAction, setCredentials } from "@/store/authSlice";
import { authService } from "@/services/authService";
import { queryKeys } from "@/lib/query/keys";
import type { LoginPayload, RegisterPayload } from "@/types/user";

const DEFAULT_REDIRECT = "/dashboard" as const;

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useSelector((state: RootState) => state.auth.token);
  const isAuthenticated = !!token;

  const { data: user, isLoading } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authService.getMe(),
    enabled: isAuthenticated,
  });

  const login = useCallback(
    async (payload: LoginPayload, options?: { redirectTo?: string }) => {
      const { user: userData, token: newToken } =
        await authService.login(payload);
      dispatch(setCredentials({ token: newToken }));
      queryClient.setQueryData(queryKeys.auth.me(), userData);
      navigate(options?.redirectTo ?? DEFAULT_REDIRECT, { replace: true });
    },
    [dispatch, queryClient, navigate],
  );

  const register = useCallback(
    async (payload: RegisterPayload, options?: { redirectTo?: string }) => {
      const { user: userData, token: newToken } =
        await authService.register(payload);
      dispatch(setCredentials({ token: newToken }));
      queryClient.setQueryData(queryKeys.auth.me(), userData);
      navigate(options?.redirectTo ?? DEFAULT_REDIRECT, { replace: true });
    },
    [dispatch, queryClient, navigate],
  );

  const updateMeMutation = useMutation({
    mutationFn: (payload: { first_name?: string; last_name?: string }) =>
      authService.updateMe(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.auth.me(), updated);
    },
  });

  const updateMe = useCallback(
    (
      payload: { first_name?: string; last_name?: string },
      options?: { onSuccess?: () => void; onError?: (error: Error) => void },
    ) => {
      updateMeMutation.mutate(payload, {
        onSuccess: () => {
          options?.onSuccess?.();
        },
      });
    },
    [updateMeMutation],
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
    queryClient.removeQueries({ queryKey: queryKeys.auth.me() });
  }, [dispatch, queryClient]);

  return {
    user: user ?? null,
    token,
    isAuthenticated,
    isLoading: isAuthenticated && isLoading,
    login,
    register,
    updateMe,
    isUpdatingProfile: updateMeMutation.isPending,
    updateProfileError: updateMeMutation.error,
    logout,
  };
}
