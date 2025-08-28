"use client";

import * as React from "react";
import { useApolloClient } from "@apollo/client/react";
import { format } from "date-fns";
import { CalendarIcon, KanbanSquare } from "lucide-react";

import { ADD_COLUMN } from "@/graphql/column";

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

type Props = {
	boardId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function CreateColumnDialog({
	boardId,
	open,
	onOpenChange,
}: Props) {
	const client = useApolloClient();

	const [submitting, setSubmitting] = React.useState(false);
	const [title, setTitle] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [status, setStatus] = React.useState<
		"active" | "planned" | "completed"
	>("active");
	const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
	const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!title.trim() || submitting) return;

		setSubmitting(true);
		try {
			await client.mutate({
				mutation: ADD_COLUMN,
				variables: {
					boardId,
					title: title.trim(),
					description: description.trim() || null,
					startDate: startDate ? startDate.toISOString() : null,
					endDate: endDate ? endDate.toISOString() : null,
					status,
				},
				optimisticResponse: {
					addColumn: {
						__typename: "Column",
						id: `temp-${Math.random().toString(36).slice(2, 8)}`,
						boardId,
						title: title.trim(),
						order: 999,
						description: description.trim() || null,
						startDate: startDate ? startDate.toISOString() : null,
						endDate: endDate ? endDate.toISOString() : null,
						status,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						cards: [],
					},
				},
			});

			// reset + close
			setTitle("");
			setDescription("");
			setStatus("active");
			setStartDate(undefined);
			setEndDate(undefined);
			onOpenChange(false);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="h-[100dvh] w-[100dvw] max-w-none rounded-none border-0 p-0 sm:h-auto sm:w-auto sm:max-w-3xl sm:rounded-2xl sm:border">
				{/* Header */}
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

				{/* Form */}
				<form onSubmit={onSubmit} className="grid gap-0 sm:grid-cols-5">
					{/* Left tips (desktop) */}
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

					{/* Fields */}
					<div className="sm:col-span-3 p-4 sm:p-6 space-y-5">
						<div className="grid gap-2">
							<Label htmlFor="title">Column name</Label>
							<Input
								id="title"
								name="title"
								placeholder="e.g., Sprint 34, Backlog, In Review"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
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
								value={description}
								onChange={(e) => setDescription(e.target.value)}
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
												!startDate && "text-muted-foreground"
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{startDate ? format(startDate, "PPP") : "Pick a date"}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={startDate}
											onSelect={setStartDate}
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
												!endDate && "text-muted-foreground"
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{endDate ? format(endDate, "PPP") : "Pick a date"}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={endDate}
											onSelect={setEndDate}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>

							<div className="grid gap-2">
								<Label>Status</Label>
								<Select
									value={status}
									onValueChange={(v) =>
										setStatus(v as "active" | "planned" | "completed")
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
								onClick={() => onOpenChange(false)}
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
