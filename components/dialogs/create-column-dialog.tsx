"use client";

import * as React from "react";
import { useApolloClient } from "@apollo/client/react";
import type { Reference } from "@apollo/client";
import { format } from "date-fns";
import { CalendarIcon, KanbanSquare } from "lucide-react";

import { ADD_COLUMN } from "@/graphql/column";

import { v4 as uuidv4 } from "uuid";

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
import { cn } from "@/lib/utils";
import { ColumnT } from "../kanban/types";
import { BOARD_QUERY } from "@/graphql/board";

type Props = {
	boardId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

type FormState = {
	title: string;
	description: string;
	status: "active" | "planned" | "completed";
	startDate?: Date;
	endDate?: Date;
};

export default function CreateColumnDialog({
	boardId,
	open,
	onOpenChange,
}: Props) {
	const client = useApolloClient();

	const [submitting, setSubmitting] = React.useState(false);
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
		onOpenChange(false);
	}

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!form.title.trim() || submitting) return;

		setSubmitting(true);
		try {
			const now = new Date().toISOString();
			const clientId = `column-${uuidv4()}`;
			const optimisticColumn: ColumnT = {
				__typename: "Column",
				id: clientId,
				boardId,
				title: form.title.trim(),
				order: 0,
				description: form.description.trim() || null,
				startDate: form.startDate ? form.startDate.toISOString() : null,
				endDate: form.endDate ? form.endDate.toISOString() : null,
				status: form.status,
				createdAt: now,
				updatedAt: now,
				cards: [],
			};
			await client.mutate<{ addColumn: ColumnT }>({
				mutation: ADD_COLUMN,
				variables: {
					boardId,
					title: form.title.trim(),
					description: form.description.trim() || null,
					startDate: form.startDate ? form.startDate.toISOString() : null,
					endDate: form.endDate ? form.endDate.toISOString() : null,
					status: form.status,
				},
				optimisticResponse: {
					addColumn: optimisticColumn,
				},
				refetchQueries: [{ query: BOARD_QUERY, variables: { boardId } }],
				awaitRefetchQueries: true,
			});

			resetAndClose();
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
			<DialogContent className="h-[100dvh] w-[100dvw] max-w-none rounded-none border-0 p-0 sm:h-auto sm:w-auto sm:max-w-3xl sm:rounded-2xl sm:border">
				<div className="border-b bg-muted/30 px-4 py-3 sm:rounded-t-2xl">
					<DialogHeader className="space-y-1">
						<div className="flex items-center gap-2">
							<KanbanSquare className="h-5 w-5 text-indigo-600" />
							<DialogTitle>Create new column</DialogTitle>
						</div>
						<DialogDescription className="text-sm">
							Sprints/columns help you group tasks by phase or timeframe.
						</DialogDescription>
					</DialogHeader>
				</div>

				<form onSubmit={onSubmit} className="grid gap-0 sm:grid-cols-5">
					<aside className="hidden sm:block sm:col-span-2 border-r bg-muted/20 p-5 sm:rounded-bl-2xl">
						<div className="space-y-4 text-sm">
							<section>
								<h4 className="font-medium text-foreground">Tips</h4>
								<ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
									<li>Use clear names (e.g., “Backlog”, “In Progress”).</li>
									<li>Add dates if using timeboxed sprints.</li>
									<li>Status helps with filtering and reports.</li>
								</ul>
							</section>
						</div>
					</aside>

					<div className="sm:col-span-3 p-4 sm:p-6 space-y-5">
						<div className="grid gap-2">
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
								className="focus-visible:ring-indigo-500"
							/>
						</div>

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
								className="min-h-[96px]"
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<div className="grid gap-2">
								<Label>Start date</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											type="button"
											variant="outline"
											disabled={submitting}
											className={cn(
												"justify-start text-left font-normal",
												!form.startDate && "text-muted-foreground"
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{form.startDate
												? format(form.startDate, "PPP")
												: "Pick a date"}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
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

							<div className="grid gap-2">
								<Label>End date</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											type="button"
											variant="outline"
											disabled={submitting}
											className={cn(
												"justify-start text-left font-normal",
												!form.endDate && "text-muted-foreground"
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{form.endDate
												? format(form.endDate, "PPP")
												: "Pick a date"}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={form.endDate}
											onSelect={(d) =>
												setForm((f) => ({ ...f, endDate: d ?? undefined }))
											}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>

							<div className="grid gap-2">
								<Label>Status</Label>
								<Select
									value={form.status}
									onValueChange={(v) =>
										setForm((f) => ({
											...f,
											status: v as "active" | "planned" | "completed",
										}))
									}
								>
									<SelectTrigger>
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
								disabled={submitting}
							>
								{submitting ? "Creating..." : "Create column"}
							</Button>
						</div>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
