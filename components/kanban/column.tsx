"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, MoreHorizontal, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CardItem from "@/components/kanban/card";
import type { ColumnT } from "@/components/kanban/types";
import NewCardButton from "../new-card.button";

export default function Column({
	index,
	column,
	onEditColumn,
	onDeleteColumn,
}: {
	index: number;
	column: ColumnT;
	onEditColumn?: () => void;
	onDeleteColumn?: () => void;
}) {
	return (
		<Draggable draggableId={`col-${column.id}`} index={index}>
			{(dragProvided) => (
				<div
					ref={dragProvided.innerRef}
					{...dragProvided.draggableProps}
					className="w-[18rem] sm:w-80 shrink-0 h-full flex flex-col"
				>
					{/* Header */}
					<div className="mb-2 flex items-center justify-between rounded-lg border bg-white dark:bg-neutral-900 px-3 py-2 shadow-sm">
						<div className="flex items-center gap-2">
							{/* dedicated drag handle (only this starts a column drag) */}
							<div
								{...dragProvided.dragHandleProps}
								className="h-7 w-7 rounded-md border flex items-center justify-center cursor-grab active:cursor-grabbing text-neutral-400"
								title="Drag column"
							>
								<GripVertical className="h-4 w-4" />
							</div>

							<span className="text-sm font-medium">{column.title}</span>

							{/* Add card stays clickable without interfering with drag */}
							<Button
								variant="outline"
								size="icon"
								className="h-7 w-7 rounded-md"
								// onClick={onAddCard}
								title="Add card"
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>

						<div className="flex items-center gap-2">
							<Badge
								variant="secondary"
								className="rounded-full bg-indigo-600 text-white hover:bg-indigo-600"
							>
								{column.cards.length}
							</Badge>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-7 w-7">
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-36">
									<DropdownMenuItem onClick={onEditColumn}>
										Edit Column
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={onDeleteColumn}
										className="text-red-600"
									>
										Delete Column
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					{/* Cards list (scrollable) */}
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
