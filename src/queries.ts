import {
  queryOptions,
  useMutation,
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Pick<Column, "name" | "id" | "boardId">) =>
      ky.post("/board/newColumn", { json: input }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries();
      queryClient.setQueryData(
        boardQueries.detail(variables.boardId).queryKey,
        (oldData) =>
          oldData
            ? {
                ...oldData,
                columns: [...oldData.columns, { ...variables }],
              }
            : undefined,
      );
    },
  });
}
