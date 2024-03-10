import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import ky from "ky";
import { Board, boardUpdateSchema, Column, Item } from "./mocks/db.ts";
import { z } from "zod";

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
    mutationFn: (json: Pick<Column, "name" | "id" | "boardId">) =>
      ky.post("/board/newColumn", { json }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries();
      queryClient.setQueryData(
        boardQueries.detail(variables.boardId).queryKey,
        (oldData) =>
          oldData
            ? {
                ...oldData,
                columns: [...oldData.columns, variables],
              }
            : undefined,
      );
    },
  });
}

export function useNewCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (json: Pick<Item, "id" | "columnId" | "title" | "boardId">) =>
      ky.post("/board/newItem", { json }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries();
      queryClient.setQueryData(
        boardQueries.detail(variables.boardId).queryKey,
        (oldData) =>
          oldData
            ? {
                ...oldData,
                items: [...oldData.items, variables],
              }
            : undefined,
      );
    },
  });
}

export function useUpdateBoardName() {
  return useMutation({
    mutationFn: (json: z.infer<typeof boardUpdateSchema>) =>
      ky.post("/board/update", { json }),
  });
}
