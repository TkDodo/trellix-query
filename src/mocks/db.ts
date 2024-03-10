import { faker } from "@faker-js/faker";
import { delay, http, HttpResponse } from "msw";
import { z } from "zod";

export const itemSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string().optional(),
  order: z.coerce.number().optional(),
  columnId: z.string().uuid(),
  boardId: z.coerce.number(),
});

export const columnSchema = z.object({
  id: z.string().uuid(),
  boardId: z.coerce.number(),
  name: z.string(),
  order: z.number().optional(),
});

export const boardSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  color: z.string(),
  columns: z.array(columnSchema),
  items: z.array(itemSchema),
});

export const boardUpdateSchema = boardSchema.pick({ id: true, name: true });

export type Board = z.infer<typeof boardSchema>;
export type Column = z.infer<typeof columnSchema>;
export type Item = z.infer<typeof itemSchema>;

const board: Board = {
  id: 1,
  name: "First board",
  color: "#e0e0e0",
  columns: [],
  items: [],
};

export const handlers = [
  http.post("/board/newColumn", async ({ request }) => {
    const newColumn = columnSchema.parse(await request.json());
    board.columns = [
      ...board.columns,
      { ...newColumn, order: board.columns.length + 1 },
    ];

    await delay();

    return HttpResponse.json({ ok: true });
  }),
  http.post("/board/newItem", async ({ request }) => {
    const newItem = itemSchema.parse(await request.json());
    board.items = [...board.items, newItem];

    await delay();

    return HttpResponse.json({ ok: true });
  }),
  http.post("/board/update", async ({ request }) => {
    const { name } = boardUpdateSchema.parse(await request.json());
    board.name = name;

    await delay();

    return HttpResponse.json({ ok: true });
  }),
  http.get("/board/*", async () => {
    await delay();
    return HttpResponse.json(board);
  }),
  /*...db.board.toHandlers("rest"),
  ...db.column.toHandlers("rest"),
  ...db.item.toHandlers("rest"),*/
];
