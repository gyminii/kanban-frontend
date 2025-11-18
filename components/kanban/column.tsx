"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import {
	MoreHorizontal,
	GripVertical,
	Calendar as CalendarIcon,
	CheckCircle2,
	AlertTriangle,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import EditColumnDialog from "../dialogs/edit-column-dialog";
import DeleteColumnDialog from "../dialogs/delete-column-dialog";

export default function Column({
	index,
	column,
	isDemo = false,
}: {
	index: number;
	column: ColumnT;
	isDemo?: boolean;
}) {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const total = column.cards.length;
	const completed = column.cards.filter((c) => c.completed).length;
	const overdueCount = column.cards.filter(
		(c) => c.dueDate && !c.completed && new Date(c.dueDate) < new Date()
	).length;
	const dueSoonCount = column.cards.filter((c) => {
		if (!c.dueDate || c.completed) return false;
		const days = (new Date(c.dueDate).getTime() - Date.now()) / 86400000;
		return days > 0 && days <= 3;
	}).length;

	const start = column.startDate ? new Date(column.startDate) : null;
	const end = column.endDate ? new Date(column.endDate) : null;

	function rangeLabel(): string | null {
		if (!start && !end) return null;
		if (start && end) {
			const sameYear = start.getFullYear() === end.getFullYear();
			const left = format(start, sameYear ? "MMM d" : "MMM d, yyyy");
			const right = format(end, "MMM d, yyyy");
			return `${left} – ${right}`;
		}
		if (start) return `From ${format(start, "MMM d, yyyy")}`;
		if (end) return `Until ${format(end, "MMM d, yyyy")}`;
		return null;
	}

	function timeboxHint(): string | null {
		const now = new Date();
		if (start && now < start) {
			const days = Math.ceil((start.getTime() - now.getTime()) / 86400000);
			return `starts in ${days}d`;
		}
		if (end) {
			const daysLeft = Math.ceil((end.getTime() - now.getTime()) / 86400000);
			if (daysLeft >= 0) return `${daysLeft}d left`;
			return `ended ${Math.abs(daysLeft)}d ago`;
		}
		return null;
	}

	const status = (column.status ?? "active") as
		| "active"
		| "planned"
		| "completed";
	const statusClass =
		status === "active"
			? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-200"
			: status === "planned"
			? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
			: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200";

	return (
		<Draggable draggableId={`col-${column.id}`} index={index}>
			{(dragProvided) => (
				<div
					ref={dragProvided.innerRef}
					{...dragProvided.draggableProps}
					className="flex-none w-80 basis-80 h-full snap-start flex flex-col"
					style={dragProvided.draggableProps.style}
				>
					{/* Header */}
					<div className="mb-2 rounded-lg border bg-white dark:bg-neutral-900 px-3 py-2 shadow-sm">
						{/* Row 1: drag + title + right controls */}
						<div className="flex items-center justify-between gap-2">
							<div className="flex min-w-0 items-center gap-2">
								<div
									{...dragProvided.dragHandleProps}
									className="h-7 w-7 rounded-md border flex items-center justify-center cursor-grab active:cursor-grabbing text-neutral-400"
									title="Drag column"
								>
									<GripVertical className="h-4 w-4" />
								</div>

								<span className="truncate text-sm font-medium">
									{column.title}
								</span>
							</div>

							<div className="flex items-center gap-2">
								{/* total cards */}
								<Badge
									variant="secondary"
									className="rounded-full bg-indigo-600 text-white hover:bg-indigo-600"
									title="Total cards"
								>
									{total}
								</Badge>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="h-7 w-7">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-36">
										<DropdownMenuItem onClick={() => setEditOpen(true)}>
											Edit Column
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setDeleteOpen(true)}
											className="text-red-600"
										>
											Delete Column
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>

						{/* Secondary header (description) */}
						{column.description ? (
							<p className="mt-1 line-clamp-2 min-h-[0] text-[11px] text-neutral-600 dark:text-neutral-300">
								{column.description}
							</p>
						) : null}

						{/* Row 2: metadata */}
						<div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
							{/* status */}
							<Badge
								variant="outline"
								className={cn("rounded-full", statusClass)}
							>
								{status[0].toUpperCase() + status.slice(1)}
							</Badge>

							{/* date range */}
							{rangeLabel() ? (
								<span className="inline-flex items-center gap-1 text-neutral-600 dark:text-neutral-300">
									<CalendarIcon className="h-3.5 w-3.5" />
									{rangeLabel()}
								</span>
							) : null}

							{/* timebox hint */}
							{timeboxHint() ? (
								<span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
									{timeboxHint()}
								</span>
							) : null}

							{/* progress */}
							<span className="ml-auto inline-flex items-center gap-1 text-neutral-600 dark:text-neutral-300">
								<CheckCircle2 className="h-3.5 w-3.5" />
								{completed}/{total}
							</span>

							{/* due health */}
							{overdueCount > 0 ? (
								<span
									title="Overdue"
									className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-rose-700 dark:bg-rose-950 dark:text-rose-200"
								>
									<AlertTriangle className="h-3.5 w-3.5" />
									{overdueCount}
								</span>
							) : null}
							{dueSoonCount > 0 ? (
								<span
									title="Due soon"
									className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200"
								>
									<CalendarIcon className="h-3.5 w-3.5" />
									{dueSoonCount}
								</span>
							) : null}
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

					<EditColumnDialog
						open={editOpen}
						onOpenChange={setEditOpen}
						column={column}
					/>
					<DeleteColumnDialog
						open={deleteOpen}
						onOpenChange={setDeleteOpen}
						columnId={column.id}
						title={column.title}
						cardCount={column.cards.length}
					/>
				</div>
			)}
		</Draggable>
	);
}
