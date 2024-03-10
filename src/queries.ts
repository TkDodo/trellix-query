import {
  queryOptions,
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query";
import ky from "ky";
import { Board, Column } from "./mocks/db.ts";

export const boardQueries = {
  all: () => ["board"],
  detail: (id: number) =>
    queryOptions({
      queryKey: [...boardQueries.all(), id],
      queryFn: () => ky.get(`/board/${id}`).json<Board>(),
    }),
  columns: (boardId: number) =>
    queryOptions({
      queryKey: [...boardQueries.detail(boardId).queryKey, "columns"],
      queryFn: () => ky.get(`/board/${boardId}/columns`).json<Array<Column>>(),
    }),
};

export function useNewColumnMutation() {
  return useMutation({
    mutationKey: ["columns", "create"],
    mutationFn: (input: Pick<Column, "name" | "id">) =>
      ky.post("/board/newColumn", { json: input }),
  });
}

// These are the inflight columns that are being created, instead of managing
// state ourselves, we just ask React Query for the state
export function usePendingColumns() {
  return useMutationState({
    filters: {
      mutationKey: ["columns", "create"],
      status: "pending",
    },
    select: (mutation) =>
      mutation.state.variables as Pick<Column, "name" | "id">,
  });
}
