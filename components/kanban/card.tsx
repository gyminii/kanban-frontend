"use client";

import { Draggable } from "@hello-pangea/dnd";
import {
	Clock,
	MoreHorizontal,
	GripVertical,
	Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardT } from "@/components/kanban/types";
import Pill from "@/components/kanban/pill";
import { formatDate } from "@/utils/format-date";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditCardDialog from "../dialogs/edit-card-dialog";
import EditDemoCardDialog from "../dialogs/edit-demo-card-dialog";
import DeleteCardDialog from "../dialogs/delete-card-dialog";
import DeleteDemoCardDialog from "../dialogs/delete-demo-card-dialog";
import { useState } from "react";

type Density = "comfy" | "compact";

type Props = {
	card: CardT;
	index: number;
	density?: Density;
	showDescription?: boolean;
	showUpdatedAt?: boolean;
	isDemo?: boolean;
};

export default function CardItem({
	card,
	index,
	density = "comfy",
	showDescription = true,
	showUpdatedAt = true,
	isDemo = false,
}: Props) {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const overdue =
		card.dueDate && !card.completed && new Date(card.dueDate) < new Date();
	const dueSoon =
		card.dueDate &&
		!card.completed &&
		!overdue &&
		(new Date(card.dueDate).getTime() - Date.now()) / 86400000 <= 3;

	const statusTone: "green" | "red" | "indigo" | "neutral" = card.completed
		? "green"
		: overdue
		? "red"
		: dueSoon
		? "indigo"
		: "neutral";

	// density styles
	const pad = density === "compact" ? "p-2.5" : "p-3.5";
	const gapY = density === "compact" ? "space-y-1.5" : "space-y-2";
	const titleSize = density === "compact" ? "text-[13px]" : "text-sm";
	const descClamp = density === "compact" ? "line-clamp-1" : "line-clamp-2";

	// --- ✅ Strong typing for tags (string[]) ---
	const tags: string[] = card.tags ?? [];
	const maxTags = density === "compact" ? 3 : 4;
	const visibleTags: string[] = tags.slice(0, maxTags);
	const overflow: number = Math.max(0, tags.length - visibleTags.length);

	return (
		<Draggable draggableId={`card-${card.id}`} index={index}>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					{...provided.draggableProps}
					className={cn(
						"group relative rounded-2xl border bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm overflow-hidden",
						"shadow-sm transition-all hover:shadow-md",
						"ring-1 ring-transparent hover:ring-indigo-200/60 dark:hover:ring-indigo-500/30",
						pad,
						snapshot.isDragging && "rotate-1 border-indigo-300 shadow-md"
					)}
				>
					{/* top gradient strip */}
					<div
						className={cn(
							"absolute inset-x-0 top-0 h-1.5",
							statusTone === "green" &&
								"bg-gradient-to-r from-emerald-400/70 to-emerald-500/60",
							statusTone === "red" &&
								"bg-gradient-to-r from-rose-400/70 to-rose-500/60",
							statusTone === "indigo" &&
								"bg-gradient-to-r from-indigo-400/70 to-indigo-500/60",
							statusTone === "neutral" &&
								"bg-gradient-to-r from-slate-300/60 to-slate-400/50 dark:from-neutral-700/60 dark:to-neutral-600/50"
						)}
					/>

					<div className={cn(gapY, "pt-1")}>
						{/* Drag + status + menu */}
						<div className="flex items-center gap-2">
							<div
								{...provided.dragHandleProps}
								className={cn(
									"mr-0.5 h-5 w-5 shrink-0 rounded-md border",
									"flex items-center justify-center",
									"cursor-grab active:cursor-grabbing text-neutral-400 bg-white dark:bg-neutral-900"
								)}
								title="Drag card"
							>
								<GripVertical className="h-3.5 w-3.5" />
							</div>

							<Pill tone={statusTone}>
								{card.completed
									? "Completed"
									: overdue
									? "Overdue"
									: dueSoon
									? "Due soon"
									: "Active"}
							</Pill>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button
										className={cn(
											"ml-auto rounded-md p-1.5",
											"text-neutral-400 hover:text-neutral-700",
											"hover:bg-neutral-100 dark:hover:bg-neutral-800"
										)}
										title="More"
										onMouseDown={(e) => e.stopPropagation()}
									>
										<MoreHorizontal className="h-4 w-4" />
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" side="right">
									<DropdownMenuItem onClick={() => setEditOpen(true)}>
										Edit
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="text-red-600 focus:text-red-600"
										onClick={() => setDeleteOpen(true)}
									>
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						{/* Title */}
						<h3
							className={cn(
								"font-medium leading-snug tracking-tight",
								titleSize,
								"text-neutral-900 dark:text-neutral-100"
							)}
						>
							{card.title}
						</h3>

						{/* Description */}
						{showDescription && card.description ? (
							<p
								className={cn(
									descClamp,
									"text-xs text-neutral-600 dark:text-neutral-300"
								)}
							>
								{card.description}
							</p>
						) : null}

						{/* Tags row */}
						{tags.length > 0 && (
							<div className="flex flex-wrap items-center gap-1 pt-0.5">
								{visibleTags.map((t: string) => (
									<span
										key={t}
										className={cn(
											"inline-flex items-center rounded-md border",
											"bg-neutral-50 text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-200",
											"px-1.5 py-0.5 text-[10px] leading-4"
										)}
										title={t}
									>
										{t}
									</span>
								))}
								{overflow > 0 && (
									<span className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] leading-4 text-neutral-500">
										+{overflow} more
									</span>
								)}
							</div>
						)}

						{/* Separator */}
						<div className="h-px w-full bg-neutral-100 dark:bg-neutral-800" />

						{/* Meta row 1 */}
						<div className="flex items-center justify-between text-[11px] text-neutral-500">
							<div className="flex items-center gap-1.5">
								<Clock className="h-3.5 w-3.5" />
								<span>{formatDate(card.dueDate)}</span>
							</div>
							{showUpdatedAt ? (
								<span className="text-neutral-400">
									{formatDate(card.updatedAt)}
								</span>
							) : (
								<span />
							)}
						</div>

						{/* Meta row 2 */}
						<div className="flex items-center justify-end text-[11px] text-neutral-400">
							<div className="flex items-center gap-1.5">
								<CalendarIcon className="h-3 w-3" />
								<span>{formatDate(card.createdAt)}</span>
							</div>
						</div>
					</div>

					{/* Dialogs */}
					{isDemo ? (
						<>
							<EditDemoCardDialog
								open={editOpen}
								onOpenChange={setEditOpen}
								card={card}
							/>
							<DeleteDemoCardDialog
								open={deleteOpen}
								onOpenChange={setDeleteOpen}
								cardId={card.id}
								title={card.title}
								dueDate={card.dueDate}
							/>
						</>
					) : (
						<>
							<EditCardDialog
								open={editOpen}
								onOpenChange={setEditOpen}
								card={card}
							/>
							<DeleteCardDialog
								open={deleteOpen}
								onOpenChange={setDeleteOpen}
								cardId={card.id}
								columnId={card.columnId}
								title={card.title}
								dueDate={card.dueDate}
							/>
						</>
					)}
				</div>
			)}
		</Draggable>
	);
}
