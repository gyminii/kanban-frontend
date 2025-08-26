"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import CardItem from "@/components/kanban/card";
import type { ColumnT } from "@/components/kanban/types";

export default function Column({
	index,
	column,
	onAddCard,
}: {
	index: number;
	column: ColumnT;
	onAddCard: () => void;
}) {
	return (
		<Draggable draggableId={`col-${column.id}`} index={index}>
			{(dragProvided) => (
				<div
					ref={dragProvided.innerRef}
					{...dragProvided.draggableProps}
					className="w-[18rem] sm:w-80 shrink-0 rounded-2xl border bg-white dark:bg-neutral-900 shadow-sm"
				>
					{/* Header */}
					<div
						{...dragProvided.dragHandleProps}
						className="flex items-center justify-between rounded-t-2xl px-3 py-2 border-b bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900"
					>
						<div className="flex items-center gap-2">
							<span className="font-semibold text-indigo-800 dark:text-indigo-300">
								{column.title}
							</span>
							<span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 px-2 py-0.5 text-xs font-medium">
								{column.cards.length}
							</span>
						</div>
						<button
							onClick={onAddCard}
							className="rounded-md px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-100 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
							title="Add card"
						>
							<Plus className="h-4 w-4" />
						</button>
					</div>

					{/* Cards */}
					<Droppable droppableId={column.id} type="CARD">
						{(dropProvided) => (
							<div
								ref={dropProvided.innerRef}
								{...dropProvided.droppableProps}
								className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[120px]"
							>
								{column.cards.length === 0 ? (
									<div className="rounded-xl border border-dashed p-4 text-center text-xs text-neutral-500">
										No cards yet — add one to get started.
									</div>
								) : (
									column.cards.map((card, i) => (
										<CardItem key={card.id} card={card} index={i} />
									))
								)}
								{dropProvided.placeholder}
							</div>
						)}
					</Droppable>

					{/* Footer */}
					<div className="border-t p-2">
						<button
							className="w-full rounded-md text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/40 py-1 text-sm"
							onClick={onAddCard}
						>
							+ Add Card
						</button>
					</div>
				</div>
			)}
		</Draggable>
	);
}
