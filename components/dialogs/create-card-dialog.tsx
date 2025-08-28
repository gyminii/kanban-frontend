"use client";

import * as React from "react";
import { useApolloClient } from "@apollo/client/react";
import type { Reference } from "@apollo/client";
import { CalendarIcon } from "lucide-react";

import { ADD_CARD, CARD_FIELDS } from "@/graphql/card";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { CardT } from "@/components/kanban/types";

type Props = {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	columnId: string;
	nextOrder?: number;
};
type ReadField = <V = unknown>(
	fieldName: string,
	ref: Reference
) => V | undefined;

export default function CreateCardDialog({
	open,
	onOpenChange,
	columnId,
	nextOrder = 0,
}: Props) {
	const client = useApolloClient();

	const [submitting, setSubmitting] = React.useState(false);
	const [title, setTitle] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [assignedTo, setAssignedTo] = React.useState("");
	const [dueDate, setDueDate] = React.useState<Date | undefined>(undefined);
	const [completed, setCompleted] = React.useState(false);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!title.trim() || submitting) return;

		const now = new Date().toISOString();
		const dueISO = dueDate
			? new Date(dueDate.setHours(12, 0, 0, 0)).toISOString()
			: null;

		const optimisticCard: CardT = {
			__typename: "Card",
			id: `optimistic-card-${Date.now()}`,
			columnId,
			title: title.trim(),
			description: description.trim() || null,
			order: nextOrder, // appended to end
			assignedTo: assignedTo.trim() || null,
			dueDate: dueISO,
			completed,
			createdAt: now,
			updatedAt: now,
		};

		setSubmitting(true);
		try {
			await client.mutate<{ addCard: CardT }>({
				mutation: ADD_CARD,
				variables: {
					columnId,
					title: optimisticCard.title,
					description: optimisticCard.description,
					assignedTo: optimisticCard.assignedTo,
					dueDate: optimisticCard.dueDate,
					completed: optimisticCard.completed,
				},
				optimisticResponse: { addCard: optimisticCard } as { addCard: CardT },
				update: (cache, { data }) => {
					const added = data?.addCard;
					if (!added) return;

					// Normalize the new card into the cache as a Reference
					const newRef = cache.writeFragment({
						fragment: CARD_FIELDS,
						data: added,
					}) as Reference;

					// Append it to the Column.cards list
					cache.modify({
						id: cache.identify({ __typename: "Column", id: columnId }),
						fields: {
							cards(
								existing: Reference | ReadonlyArray<Reference> | undefined,
								helpers: { readField: ReadField }
							): Reference | ReadonlyArray<Reference> | undefined {
								const { readField } = helpers;

								// normalize to array
								const list: ReadonlyArray<Reference> = Array.isArray(existing)
									? existing
									: existing
									? [existing]
									: [];

								// de-dupe by id
								const newId = readField<string>("id", newRef);
								const has = list.some(
									(ref) => readField<string>("id", ref) === newId
								);

								const next = has ? list : [...list, newRef];

								// return same shape as input
								return Array.isArray(existing) ? next : next[0];
							},
						},
					});
				},
			});

			// reset + close
			setTitle("");
			setDescription("");
			setAssignedTo("");
			setDueDate(undefined);
			setCompleted(false);
			onOpenChange(false);
		} catch (err) {
			console.error(err);
			// keep dialog open to allow correction if needed
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="text-indigo-700 dark:text-indigo-400">
						Create task
					</DialogTitle>
					<DialogDescription>Add a new card to this column.</DialogDescription>
				</DialogHeader>

				<form onSubmit={onSubmit} className="space-y-4">
					{/* Title */}
					<div className="grid gap-2">
						<Label htmlFor="title">Title</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Write a clear task name"
							required
							disabled={submitting}
							className="focus-visible:ring-indigo-500"
						/>
					</div>

					{/* Description */}
					<div className="grid gap-2">
						<Label htmlFor="description">Description (optional)</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Add context or checklists"
							disabled={submitting}
							className="min-h-[90px]"
						/>
					</div>

					{/* Assigned + Due */}
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="assignedTo">Assigned to (user ID)</Label>
							<Input
								id="assignedTo"
								value={assignedTo}
								onChange={(e) => setAssignedTo(e.target.value)}
								placeholder="u_12345"
								disabled={submitting}
							/>
						</div>

						<div className="grid gap-2">
							<Label>Due date</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										type="button"
										variant="outline"
										className="w-full justify-start text-left font-normal"
										disabled={submitting}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{dueDate ? (
											dueDate.toDateString()
										) : (
											<span>Pick a date</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="p-0" align="start">
									<Calendar
										mode="single"
										selected={dueDate}
										onSelect={setDueDate}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					{/* Completed */}
					<div className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
						<div className="space-y-0.5">
							<div className="text-sm font-medium">Mark as completed</div>
							<div className="text-xs text-muted-foreground">
								You can change this later.
							</div>
						</div>
						<Switch
							checked={completed}
							onCheckedChange={setCompleted}
							disabled={submitting}
						/>
					</div>

					<div className="flex justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="ghost"
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
							{submitting ? "Creating..." : "Create task"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
