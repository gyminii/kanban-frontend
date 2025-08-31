"use client";

import * as React from "react";
import { useApolloClient } from "@apollo/client/react";
import {
	format,
	addDays,
	startOfWeek,
	endOfWeek,
	isBefore,
	isAfter,
} from "date-fns";
import { CalendarIcon, KanbanSquare } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

import { ADD_COLUMN } from "@/graphql/column";
import { BOARD_QUERY } from "@/graphql/board";

import { cn } from "@/lib/utils";
import type { ColumnT } from "@/components/kanban/types";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";

/** Convert Date -> ISO at 12:00 to avoid tz midnight drift. */
function toMiddayISO(d?: Date): string | null {
	if (!d) return null;
	const n = new Date(d);
	n.setHours(12, 0, 0, 0);
	return n.toISOString();
}

type Props = {
	boardId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	nextOrder?: number;
};

type StatusVal = "active" | "planned" | "completed";

type FormState = {
	title: string;
	description: string;
	status: StatusVal;
	startDate?: Date;
	endDate?: Date;
};

export default function CreateColumnDialog({
	boardId,
	open,
	onOpenChange,
	nextOrder = 0,
}: Props) {
	const client = useApolloClient();
	const [submitting, setSubmitting] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const [form, setForm] = React.useState<FormState>({
		title: "",
		description: "",
		status: "active",
		startDate: undefined,
		endDate: undefined,
	});

	function resetAndClose() {
		setForm({
			title: "",
			description: "",
			status: "active",
			startDate: undefined,
			endDate: undefined,
		});
		setError(null);
		onOpenChange(false);
	}

	React.useEffect(() => {
		if (
			form.startDate &&
			form.endDate &&
			isBefore(form.endDate, form.startDate)
		) {
			setError("End date cannot be earlier than start date.");
		} else {
			setError(null);
		}
	}, [form.startDate, form.endDate]);

	React.useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
				(
					document.getElementById(
						"create-column-form"
					) as HTMLFormElement | null
				)?.requestSubmit();
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open]);

	// Presets
	function setThisWeek() {
		const start = startOfWeek(new Date(), { weekStartsOn: 1 });
		const end = endOfWeek(new Date(), { weekStartsOn: 1 });
		setForm((f) => ({ ...f, startDate: start, endDate: end }));
	}
	function setNextWeek() {
		const start = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7);
		const end = addDays(endOfWeek(new Date(), { weekStartsOn: 1 }), 7);
		setForm((f) => ({ ...f, startDate: start, endDate: end }));
	}
	function setTwoWeeks() {
		const start = startOfWeek(new Date(), { weekStartsOn: 1 });
		const end = addDays(start, 13);
		setForm((f) => ({ ...f, startDate: start, endDate: end }));
	}

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const title = form.title.trim();
		if (!title || submitting || error) return;

		const description = form.description.trim()
			? form.description.trim()
			: null;
		const startDateISO = toMiddayISO(form.startDate);
		const endDateISO = toMiddayISO(form.endDate);

		setSubmitting(true);
		try {
			const now = new Date().toISOString();
			const clientId = `column-${uuidv4()}`;

			const optimisticColumn: ColumnT = {
				__typename: "Column",
				id: clientId,
				boardId,
				title,
				order: nextOrder,
				description,
				startDate: startDateISO,
				endDate: endDateISO,
				status: form.status,
				createdAt: now,
				updatedAt: now,
				cards: [],
			};

			await client.mutate<{ addColumn: ColumnT }>({
				mutation: ADD_COLUMN,
				variables: {
					boardId,
					title,
					description,
					startDate: startDateISO,
					endDate: endDateISO,
					status: form.status,
				},
				optimisticResponse: { addColumn: optimisticColumn },
				refetchQueries: [{ query: BOARD_QUERY, variables: { boardId } }],
				awaitRefetchQueries: true,
			});

			toast.success("Column created");
			resetAndClose();
		} catch {
			toast.error("Failed to create column");
		} finally {
			setSubmitting(false);
		}
	}

	const titleHelp =
		form.status === "planned"
			? "Tip: include a target sprint number or date range."
			: form.status === "completed"
			? "Consider adding a short summary in the description."
			: "Use an action-oriented name (e.g., In Progress, Review).";

	return (
		<Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
			<DialogContent className="h-[100dvh] w-[100dvw] max-w-none rounded-none border-0 p-0 sm:h-auto sm:w-auto sm:max-w-3xl sm:rounded-2xl sm:border">
				{/* Header */}
				<div className="border-b bg-gradient-to-r from-indigo-50/80 to-white dark:from-neutral-900 dark:to-neutral-900 px-4 py-3 sm:rounded-t-2xl">
					<DialogHeader className="space-y-1">
						<div className="flex items-center gap-2">
							<KanbanSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
							<DialogTitle>Create new column</DialogTitle>
						</div>
						<DialogDescription className="text-sm">
							Sprints/columns help you group tasks by phase or timeframe.
						</DialogDescription>
					</DialogHeader>
				</div>

				<form
					id="create-column-form"
					onSubmit={onSubmit}
					className="grid gap-0 sm:grid-cols-[260px_minmax(0,1fr)]"
				>
					{/* Sidebar */}
					<aside className="hidden sm:block border-r bg-muted/20 p-5 sm:rounded-bl-2xl">
						<div className="space-y-4 text-sm">
							<section>
								<h4 className="font-medium text-foreground">Tips</h4>
								<ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
									<li>Use clear names (e.g., “Backlog”, “In Progress”).</li>
									<li>Add dates if using timeboxed sprints.</li>
									<li>Status helps with filtering and reports.</li>
								</ul>
							</section>

							<section>
								<h4 className="mt-4 font-medium text-foreground">Presets</h4>
								<div className="mt-2 grid grid-cols-2 gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="w-full"
										onClick={setThisWeek}
									>
										This week
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="w-full"
										onClick={setNextWeek}
									>
										Next week
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="w-full"
										onClick={setTwoWeeks}
									>
										Two weeks
									</Button>
								</div>
							</section>
						</div>
					</aside>

					{/* Form */}
					<div className="p-4 sm:p-6 space-y-5">
						{/* Row: Column name + Status (aligned, full width) */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="min-w-0">
								<Label htmlFor="title">Column name</Label>
								<Input
									id="title"
									name="title"
									placeholder="e.g., Sprint 34, Backlog, In Review"
									value={form.title}
									onChange={(e) =>
										setForm((f) => ({ ...f, title: e.target.value }))
									}
									required
									disabled={submitting}
									className="mt-1 h-10 w-full focus-visible:ring-indigo-500"
									autoFocus
								/>
								<p className="mt-1 text-[11px] text-muted-foreground">
									{titleHelp}
								</p>
							</div>

							<div className="min-w-0">
								<Label htmlFor="status">Status</Label>
								<Select
									value={form.status}
									onValueChange={(v) =>
										setForm((f) => ({ ...f, status: v as StatusVal }))
									}
								>
									<SelectTrigger id="status" className="mt-1 h-10 w-full">
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="planned">Planned</SelectItem>
										<SelectItem value="completed">Completed</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Description */}
						<div className="grid gap-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								name="description"
								placeholder="Optional notes about this column"
								value={form.description}
								onChange={(e) =>
									setForm((f) => ({ ...f, description: e.target.value }))
								}
								disabled={submitting}
								className="min-h-[96px] w-full"
							/>
						</div>

						{/* Dates row (full width controls, stable popovers) */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="min-w-0">
								<Label>Start date</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											type="button"
											variant="outline"
											disabled={submitting}
											className={cn(
												"mt-1 h-10 w-full justify-start text-left font-normal",
												!form.startDate && "text-muted-foreground"
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{form.startDate
												? format(form.startDate, "PPP")
												: "Pick a date"}
										</Button>
									</PopoverTrigger>
									<PopoverContent
										align="start"
										className="w-auto p-0"
										sideOffset={8}
									>
										<Calendar
											mode="single"
											selected={form.startDate}
											onSelect={(d) =>
												setForm((f) => ({ ...f, startDate: d ?? undefined }))
											}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>

							<div className="min-w-0">
								<Label>End date</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											type="button"
											variant="outline"
											disabled={submitting}
											className={cn(
												"mt-1 h-10 w-full justify-start text-left font-normal",
												!form.endDate && "text-muted-foreground",
												error && "border-red-300 text-red-700 dark:text-red-300"
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{form.endDate
												? format(form.endDate, "PPP")
												: "Pick a date"}
										</Button>
									</PopoverTrigger>
									<PopoverContent
										align="start"
										className="w-auto p-0"
										sideOffset={8}
									>
										<Calendar
											mode="single"
											selected={form.endDate}
											onSelect={(d) =>
												setForm((f) => ({ ...f, endDate: d ?? undefined }))
											}
											initialFocus
											disabled={(date) =>
												Boolean(form.startDate && isAfter(form.startDate, date))
											}
										/>
									</PopoverContent>
								</Popover>
								{error ? (
									<p className="mt-1 text-xs text-red-600 dark:text-red-400">
										{error}
									</p>
								) : null}
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center justify-end gap-2 pt-2">
							<Button
								type="button"
								variant="outline"
								onClick={resetAndClose}
								disabled={submitting}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								className="bg-indigo-600 text-white hover:bg-indigo-700"
								disabled={submitting || Boolean(error)}
							>
								{submitting ? "Creating..." : "Create column"}
							</Button>
						</div>

						<p className="text-[11px] text-muted-foreground">
							Tip: Press <kbd className="rounded border px-1">⌘</kbd>/
							<kbd className="rounded border px-1">Ctrl</kbd>+
							<kbd className="rounded border px-1">Enter</kbd> to create
							quickly.
						</p>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
