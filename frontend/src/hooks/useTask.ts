import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { boardService } from "@/services/boardService";

export function useTask() {
  const query = useQuery({
    queryKey: queryKeys.tasks.summary(),
    queryFn: () => boardService.getTaskSummary(),
  });

  return {
    summary: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
