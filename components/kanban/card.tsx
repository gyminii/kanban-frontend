"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Clock, MoreHorizontal, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardT } from "@/components/kanban/types";

function Pill({
	children,
	tone = "indigo",
}: {
	children: React.ReactNode;
	tone?: "indigo" | "green" | "red" | "neutral";
}) {
	const tones: Record<string, string> = {
		indigo:
			"bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
		green:
			"bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
		red: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
		neutral:
			"bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
	};
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
				tones[tone]
			)}
		>
			{children}
		</span>
	);
}

export default function CardItem({
	card,
	index,
}: {
	card: CardT;
	index: number;
}) {
	const shortId = card.id.slice(-6);
	const overdue =
		card.dueDate && !card.completed && new Date(card.dueDate) < new Date();
	const dueSoon =
		card.dueDate &&
		!card.completed &&
		!overdue &&
		(new Date(card.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24) <=
			3;

	return (
		<Draggable draggableId={`card-${card.id}`} index={index}>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					className={cn(
						"rounded-xl border bg-white dark:bg-neutral-900 p-3 shadow-sm hover:shadow transition-shadow",
						snapshot.isDragging ? "rotate-1 border-indigo-400 shadow-md" : ""
					)}
				>
					{/* badges row */}
					<div className="mb-2 flex items-center gap-2">
						{card.completed ? (
							<Pill tone="green">Completed</Pill>
						) : overdue ? (
							<Pill tone="red">Overdue</Pill>
						) : dueSoon ? (
							<Pill tone="indigo">Due soon</Pill>
						) : (
							<Pill tone="neutral">Active</Pill>
						)}
						{card.assignedTo ? (
							<Pill>
								<span className="inline-flex items-center gap-1">
									<User className="h-3 w-3" />
									{card.assignedTo}
								</span>
							</Pill>
						) : null}
					</div>

					{/* title + actions */}
					<div className="flex items-start justify-between gap-2">
						<h3 className="line-clamp-2 font-medium text-sm">{card.title}</h3>
						<button
							className="rounded-md p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
							title="More"
						>
							<MoreHorizontal className="h-4 w-4" />
						</button>
					</div>

					{/* meta */}
					<div className="mt-1 text-xs text-neutral-500">ID: {shortId}</div>

					<div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
						<div className="flex items-center gap-1">
							<Clock className="h-3.5 w-3.5" />
							<span>
								{card.dueDate
									? new Date(card.dueDate).toLocaleDateString()
									: "No due date"}
							</span>
						</div>
						<span className="text-neutral-400">
							{new Date(card.updatedAt).toLocaleDateString()}
						</span>
					</div>
				</div>
			)}
		</Draggable>
	);
}
