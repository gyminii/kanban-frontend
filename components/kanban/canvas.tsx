"use client";

import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import Column from "@/components/kanban/column";
import type { ColumnT } from "@/components/kanban/types";
import { useBoardDnd } from "@/hooks/use-board-dnd";
import { useDemoBoardDnd } from "@/hooks/use-demo-board-dnd";
import { useDemoStore } from "@/utils/demo/store";

export default function KanbanCanvas() {
	const isDemo = useDemoStore((state) => state.isDemo);
	const demoBoardResult = useDemoBoardDnd();
	const boardResult = useBoardDnd();

	const { board, onDragEnd } = isDemo ? demoBoardResult : boardResult;

	const columns = board.columns ?? [];
	const cols: ColumnT[] = (columns ?? []).filter(
		(c): c is ColumnT => !!c && typeof c.id === "string"
	);

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
								"flex h-[50rem] min-w-0 gap-4",
								// scrolling
								"overflow-x-auto overflow-y-hidden",
								// snap & feel
								"snap-x snap-mandatory scroll-px-4",
								"px-4 py-4",
								"motion-safe:[scroll-behavior:smooth]",
							].join(" ")}
						>
							{cols.map((col, i) => (
								<Column key={col.id} index={i} column={col} />
							))}
							{dropProvided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
		</div>
	);
}
