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
import { useDemoStore } from "@/utils/demo/store";

type Density = "comfy" | "compact";

type Props = {
	card: CardT;
	index: number;
	density?: Density;
	showDescription?: boolean;
	showUpdatedAt?: boolean;
};

export default function CardItem({
	card,
	index,
	density = "comfy",
	showDescription = true,
	showUpdatedAt = true,
}: Props) {
	const isDemo = useDemoStore((state) => state.isDemo);
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
						"group relative rounded-xl border bg-card overflow-hidden",
						"shadow-sm transition-all duration-200 ease-out",
						"hover:shadow-md hover:scale-[1.01] hover:border-primary/30",
						pad,
						snapshot.isDragging && "scale-[1.02] border-primary shadow-lg"
					)}
				>
					{/* top solid strip */}
					<div
						className={cn(
							"absolute inset-x-0 top-0 h-1",
							statusTone === "green" && "bg-emerald-500",
							statusTone === "red" && "bg-rose-500",
							statusTone === "indigo" && "bg-primary",
							statusTone === "neutral" && "bg-border"
						)}
					/>

					<div className={cn(gapY, "pt-1")}>
						{/* Drag + status + menu */}
						<div className="flex items-center gap-2">
							<div
								{...provided.dragHandleProps}
								className={cn(
									"mr-0.5 h-5 w-5 shrink-0 rounded-lg border",
									"flex items-center justify-center",
									"cursor-grab active:cursor-grabbing",
									"text-muted-foreground hover:text-foreground",
									"hover:bg-secondary transition-colors duration-200"
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
											"ml-auto rounded-lg p-1.5",
											"text-muted-foreground hover:text-foreground",
											"hover:bg-secondary transition-colors duration-200"
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
								"font-semibold leading-snug tracking-tight",
								titleSize,
								"text-foreground"
							)}
						>
							{card.title}
						</h3>

						{/* Description */}
						{showDescription && card.description ? (
							<p
								className={cn(
									descClamp,
									"text-xs text-muted-foreground leading-relaxed"
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
											"inline-flex items-center rounded-lg border bg-secondary",
											"text-secondary-foreground",
											"px-1.5 py-0.5 text-[10px] font-medium leading-4"
										)}
										title={t}
									>
										{t}
									</span>
								))}
								{overflow > 0 && (
									<span className="inline-flex items-center rounded-lg border bg-secondary text-muted-foreground px-1.5 py-0.5 text-[10px] leading-4">
										+{overflow} more
									</span>
								)}
							</div>
						)}

						{/* Separator */}
						<div className="h-px w-full bg-border" />

						{/* Meta row 1 */}
						<div className="flex items-center justify-between text-[11px] text-muted-foreground">
							<div className="flex items-center gap-1.5">
								<Clock className="h-3.5 w-3.5" />
								<span>{formatDate(card.dueDate)}</span>
							</div>
							{showUpdatedAt ? (
								<span className="text-muted-foreground/70">
									{formatDate(card.updatedAt)}
								</span>
							) : (
								<span />
							)}
						</div>

						{/* Meta row 2 */}
						<div className="flex items-center justify-end text-[11px] text-muted-foreground/70">
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
