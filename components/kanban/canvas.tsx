"use client";

import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import Column from "@/components/kanban/column";
import type { ColumnT } from "@/components/kanban/types";

export default function KanbanCanvas({
	columns,
	onDragEnd,
}: {
	columns?: ColumnT[];
	onDragEnd: (result: DropResult) => void;
}) {
	const cols: ColumnT[] = (columns ?? [])
		.filter((c): c is ColumnT => !!c && typeof c.id === "string")
		.slice()
		.sort((a, b) => a.order - b.order);

	return (
		<div className="relative h-full rounded-xl border bg-muted/30 dark:bg-muted/20 shadow-sm">
			{/* left & right edge fades */}
			<div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background/70 to-transparent rounded-l-xl" />
			<div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background/70 to-transparent rounded-r-xl" />

			<DragDropContext onDragEnd={onDragEnd}>
				<Droppable droppableId="columns" direction="horizontal" type="COLUMN">
					{(dropProvided) => (
						<div
							ref={dropProvided.innerRef}
							{...dropProvided.droppableProps}
							className={[
								// layout
								"flex h-full min-w-0 gap-4",
								// scrolling
								"overflow-x-auto overflow-y-hidden",
								// snap & feel
								"snap-x snap-mandatory scroll-px-4",
								"px-4 py-4", // inner padding for the board surface
								// smoother momentum on macOS/iOS
								"motion-safe:[scroll-behavior:smooth]",
							].join(" ")}
						>
							{cols.map((col, index) => (
								<div
									key={col.id}
									className="snap-start shrink-0"
									// a sane default width for columns so they look tidy
									style={{ minWidth: 320, maxWidth: 360 }}
								>
									<Column index={index} column={col} />
								</div>
							))}
							{dropProvided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
		</div>
	);
}
