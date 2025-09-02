"use client";

import { useApolloClient } from "@apollo/client/react";
import { toast } from "sonner";
import { format, isBefore, isAfter } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { UPDATE_COLUMN } from "@/graphql/column";
import type { ColumnT } from "@/components/kanban/types";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Props = {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	column: ColumnT;
};

type UpdateColumnPayload = {
	updateColumn: ColumnT;
};

type StatusVal = "active" | "planned" | "completed";

type FormState = {
	title: string;
	description: string;
	status: StatusVal;
	startDate?: Date;
	endDate?: Date;
};

/** Convert Date -> ISO at 12:00 to avoid tz midnight drift. */
function toMiddayISO(d?: Date): string | null {
	if (!d) return null;
	const n = new Date(d);
	n.setHours(12, 0, 0, 0);
	return n.toISOString();
}

export default function EditColumnDialog({
	open,
	onOpenChange,
	column,
}: Props) {
	const client = useApolloClient();
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [form, setForm] = useState<FormState>(() => ({
		title: column.title ?? "",
		description: column.description ?? "",
		status: (column.status as StatusVal) ?? "active",
		startDate: column.startDate ? new Date(column.startDate) : undefined,
		endDate: column.endDate ? new Date(column.endDate) : undefined,
	}));

	useEffect(() => {
		if (!open) return;
		setForm({
			title: column.title ?? "",
			description: column.description ?? "",
			status: (column.status as StatusVal) ?? "active",
			startDate: column.startDate ? new Date(column.startDate) : undefined,
			endDate: column.endDate ? new Date(column.endDate) : undefined,
		});
	}, [open, column]);

	useEffect(() => {
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

	function resetAndClose(): void {
		onOpenChange(false);
	}

	async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
		e.preventDefault();
		const title = form.title.trim();
		if (!title || submitting || error) return;

		const updatedAt = new Date().toISOString();
		const description = form.description.trim()
			? form.description.trim()
			: null;
		const startISO = toMiddayISO(form.startDate);
		const endISO = toMiddayISO(form.endDate);

		setSubmitting(true);
		try {
			const res = await client.mutate<UpdateColumnPayload>({
				mutation: UPDATE_COLUMN,
				variables: {
					columnId: column.id,
					title,
					description,
					startDate: startISO,
					endDate: endISO,
					status: form.status,
				},
				optimisticResponse: {
					updateColumn: {
						__typename: "Column",
						id: column.id,
						boardId: column.boardId,
						title,
						order: column.order,
						description,
						startDate: startISO,
						endDate: endISO,
						status: form.status,
						createdAt: column.createdAt,
						updatedAt,
						cards: column.cards,
					},
				},
				update(cache, { data }) {
					const next = data?.updateColumn;
					const entityId = cache.identify({
						__typename: "Column",
						id: column.id,
					});
					if (!entityId) return;

					cache.modify({
						id: entityId,
						fields: {
							title: () => (next ? next.title : title),
							description: () => (next ? next.description : description),
							status: () => (next ? next.status : form.status),
							startDate: () => (next ? next.startDate : startISO),
							endDate: () => (next ? next.endDate : endISO),
							updatedAt: () => (next ? next.updatedAt : updatedAt),
						},
					});
				},
			});

			if (!res.data?.updateColumn) throw new Error("No column returned");

			toast.success("Column updated");
			resetAndClose();
		} catch {
			toast.error("Failed to update column");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="text-indigo-700 dark:text-indigo-400">
						Edit column
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={onSubmit} className="space-y-4">
					{/* Title + Status */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="min-w-0">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								value={form.title}
								onChange={(e) =>
									setForm((f) => ({ ...f, title: e.target.value }))
								}
								placeholder="e.g., Sprint 34, Review, Backlog"
								required
								disabled={submitting}
								className="mt-1 h-10 w-full focus-visible:ring-indigo-500"
							/>
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
							value={form.description}
							onChange={(e) =>
								setForm((f) => ({ ...f, description: e.target.value }))
							}
							placeholder="Optional notes about this column"
							disabled={submitting}
							className="min-h-[96px]"
						/>
					</div>

					{/* Dates */}
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
										{form.endDate ? format(form.endDate, "PPP") : "Pick a date"}
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

					<DialogFooter className="pt-2">
						<Button
							type="button"
							variant="ghost"
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
							{submitting ? "Saving…" : "Save changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
