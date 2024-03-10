import { useRef } from "react";
import invariant from "tiny-invariant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { boardQueries, useUpdateBoardName } from "./queries.ts";
import { EditableText } from "./components.tsx";
import { NewColumn } from "./new-column.tsx";
import { Column as ColumnComponent } from "./column.tsx";
import type { Column } from "./mocks/db.ts";

export function Board() {
  const { data: board } = useSuspenseQuery(boardQueries.detail(1));
  const { mutate, variables, status } = useUpdateBoardName();

  // scroll right when new columns are added
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  function scrollRight() {
    invariant(scrollContainerRef.current, "no scroll container");
    scrollContainerRef.current.scrollLeft =
      scrollContainerRef.current.scrollWidth;
  }

  const itemsById = new Map(board.items.map((item) => [item.id, item]));
  type ColumnWithItems = Column & { items: typeof board.items };
  const columns = new Map<string, ColumnWithItems>();
  for (const column of [...board.columns]) {
    columns.set(column.id, { ...column, items: [] });
  }

  // add items to their columns
  for (const item of itemsById.values()) {
    const columnId = item.columnId;
    const column = columns.get(columnId);
    invariant(column, "missing column");
    column.items.push(item);
  }

  const boardName = status === "pending" ? variables.name : board.name;

  return (
    <div
      className="h-full min-h-0 flex flex-col overflow-x-scroll"
      ref={scrollContainerRef}
      style={{ backgroundColor: board.color }}
    >
      <h1>
        <EditableText
          value={boardName}
          fieldName="name"
          inputClassName="mx-8 my-4 text-2xl font-medium border border-slate-400 rounded-lg py-1 px-2 text-black"
          buttonClassName="mx-8 my-4 text-2xl font-medium block rounded-lg text-left border border-transparent py-1 px-2 text-slate-800"
          buttonLabel={`Edit board "${boardName}" name`}
          inputLabel="Edit board name"
          onSubmit={(name) => {
            mutate({ name, id: board.id });
          }}
        />
      </h1>

      <div className="flex flex-grow min-h-0 h-full items-start gap-4 px-8 pb-4">
        {[...columns.values()].map((col) => {
          return (
            <ColumnComponent
              key={col.id}
              name={col.name}
              columnId={col.id}
              boardId={board.id}
              items={col.items}
            />
          );
        })}
        <NewColumn
          boardId={board.id}
          onAdd={scrollRight}
          editInitially={board.columns.length === 0}
        />
      </div>

      {/* trolling you to add some extra margin to the right of the container with a whole dang div */}
      <div data-lol className="w-8 h-1 flex-shrink-0" />
    </div>
  );
}
