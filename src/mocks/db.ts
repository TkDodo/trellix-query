import { faker } from "@faker-js/faker";
import { delay, http, HttpResponse } from "msw";
import { z } from "zod";

export const itemSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  order: z.number(),
});

export const columnSchema = z.object({
  id: z.string(),
  boardId: z.coerce.number(),
  name: z.string(),
  order: z.number().optional(),
  items: z.array(itemSchema).optional(),
});

export const boardSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
  columns: z.array(columnSchema),
});

export type Board = z.infer<typeof boardSchema>;
export type Column = z.infer<typeof columnSchema>;
export type Item = z.infer<typeof itemSchema>;

const board: Board = {
  id: 1,
  name: "First board",
  color: "#e0e0e0",
  columns: [],
};

export const handlers = [
  http.get("/board/*", async () => {
    await delay(250);
    return HttpResponse.json(board);
  }),
  http.post("/board/newColumn", async ({ request }) => {
    const newColumn = (await request.json()) as Column;
    board.columns = [
      ...board.columns,
      { ...newColumn, order: board.columns.length + 1 },
    ];

    await delay(500);

    return HttpResponse.json({ ok: true });
  }),
  /*...db.board.toHandlers("rest"),
  ...db.column.toHandlers("rest"),
  ...db.item.toHandlers("rest"),*/
];
