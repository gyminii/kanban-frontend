"use client";

import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import Column from "@/components/kanban/column";
import type { ColumnT } from "@/components/kanban/types";

export default function KanbanCanvas({
	columns,
	onDragEnd,
	onAddCard,
}: {
	columns?: ColumnT[];
	onDragEnd: (result: DropResult) => void;
	onAddCard: (columnId: string) => void;
}) {
	// 1) default to []  2) drop falsy  3) drop items lacking an id  4) keep a stable order
	const cols: ColumnT[] = (columns ?? [])
		.filter((c): c is ColumnT => !!c && typeof c.id === "string")
		.slice()
		.sort((a, b) => a.order - b.order);

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId="columns" direction="horizontal" type="COLUMN">
				{(dropProvided) => (
					<div
						ref={dropProvided.innerRef}
						{...dropProvided.droppableProps}
						className="flex h-full gap-4 overflow-x-auto pb-4 -mx-2 px-2"
					>
						{cols.map((col, index) => (
							<Column
								key={col.id}
								index={index}
								column={col}
								onAddCard={() => onAddCard(col.id)}
							/>
						))}
						{dropProvided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
}
