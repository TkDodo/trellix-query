import { faker } from "@faker-js/faker";
import { factory, manyOf, nullable, oneOf, primaryKey } from "@mswjs/data";

export const db = factory({
  board: {
    id: primaryKey(faker.string.uuid),
    name: String,
    color: String,
    createdAt: () => Date.now(),
    columns: manyOf("column"),
  },
  column: {
    id: primaryKey(faker.string.uuid),
    name: String,
    order: Number,
    items: manyOf("item"),
    board: oneOf("board"),
  },
  item: {
    id: primaryKey(faker.string.uuid),
    title: String,
    content: nullable(String),
    order: Number,
    column: oneOf("column"),
  },
});

const teh_board = db.board.create({
  name: "First board",
  color: "#e0e0e0",
  columns: [],
});

export const handlers = [
  ...db.board.toHandlers("rest"),
  ...db.column.toHandlers("rest"),
  ...db.item.toHandlers("rest"),
];
