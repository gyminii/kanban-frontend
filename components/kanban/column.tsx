"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CardItem from "@/components/kanban/card";
import type { ColumnT } from "@/components/kanban/types";
import NewCardButton from "../new-card.button";

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
					className="w-[18rem] sm:w-80 shrink-0 h-full flex flex-col"
				>
					{/* Floating island header (completely outside the bordered list) */}
					<div
						{...dragProvided.dragHandleProps}
						className="mb-2 flex items-center justify-between rounded-full border bg-white dark:bg-neutral-900 px-3 py-2 shadow-sm"
					>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="icon"
								className="h-7 w-7 rounded-md"
								onClick={onAddCard}
								title="Add card"
							>
								<Plus className="h-4 w-4" />
							</Button>
							<span className="text-sm font-medium">{column.title}</span>
						</div>
						<Badge
							variant="secondary"
							className="rounded-full bg-indigo-600 text-white hover:bg-indigo-600"
						>
							{column.cards.length}
						</Badge>
					</div>

					{/* Bordered shadcn “card” list (separate block, fills the rest) */}
					<div className="flex min-h-0 flex-1 flex-col rounded-2xl border bg-white dark:bg-neutral-900 shadow-sm">
						<Droppable droppableId={column.id} type="CARD">
							{(dropProvided) => (
								<div
									ref={dropProvided.innerRef}
									{...dropProvided.droppableProps}
									className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3"
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

						<div className="border-t px-3 py-2">
							<NewCardButton
								columnId={column.id}
								nextOrder={column.cards.length}
							/>
						</div>
					</div>
				</div>
			)}
		</Draggable>
	);
}
