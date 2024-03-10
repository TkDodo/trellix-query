import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import ky from "ky";
import {
  Board,
  updateSchema,
  deleteItemSchema,
  newColumnSchema,
  itemSchema,
} from "./mocks/db.ts";
import { z } from "zod";

export const boardQueries = {
  detail: (id: number) =>
    queryOptions({
      queryKey: ["board", id],
      queryFn: () => ky.get(`/board/${id}`).json<Board>(),
    }),
};

export function useNewColumnMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (json: z.infer<typeof newColumnSchema>) =>
      ky.post("/board/newColumn", { json }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries();
      queryClient.setQueryData(
        boardQueries.detail(variables.boardId).queryKey,
        (oldData) =>
          oldData
            ? {
                ...oldData,
                columns: [
                  ...oldData.columns,
                  { ...variables, order: oldData.columns.length + 1 },
                ],
              }
            : undefined,
      );
    },
  });
}

export function useNewCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (json: z.infer<typeof itemSchema>) =>
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

export function useDeleteCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (json: z.infer<typeof deleteItemSchema>) =>
      ky.post("/board/deleteItem", { json }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries();

      queryClient.setQueryData(
        boardQueries.detail(variables.boardId).queryKey,
        (oldData) =>
          oldData
            ? {
                ...oldData,
                items: oldData.items.filter((item) => item.id !== variables.id),
              }
            : undefined,
      );
    },
  });
}

export function useUpdateMutation() {
  return useMutation({
    mutationFn: (json: z.infer<typeof updateSchema>) =>
      ky.post("/board/update", { json }),
  });
}
