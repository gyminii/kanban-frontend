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
	const cols = (columns ?? []).slice().sort((a, b) => a.order - b.order);

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
