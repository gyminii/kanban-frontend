"use client";

import { useApolloClient } from "@apollo/client/react";
import { CalendarIcon, Hash, Tag } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import type { CardT } from "@/components/kanban/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ADD_CARD } from "@/graphql/card";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Reference } from "@apollo/client";
import { CARD_FIELDS } from "@/graphql/fragments";

type Props = {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	columnId: string;
	nextOrder?: number;
};

type FormState = {
	title: string;
	description: string;
	assignedTo: string;
	dueDate?: Date;
	completed: boolean;
	tagsInput: string;
};

export default function CreateCardDialog({
	open,
	onOpenChange,
	columnId,
	nextOrder = 0,
}: Props) {
	const client = useApolloClient();
	const { boardId } = useParams<{ boardId: string }>();
	const [submitting, setSubmitting] = useState(false);
	const [form, setForm] = useState<FormState>({
		title: "",
		description: "",
		assignedTo: "",
		dueDate: undefined,
		completed: false,
		tagsInput: "",
	});

	function resetAndClose() {
		setForm({
			title: "",
			description: "",
			assignedTo: "",
			dueDate: undefined,
			completed: false,
			tagsInput: "",
		});
		onOpenChange(false);
	}

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!form.title.trim() || submitting) return;

		const now = new Date().toISOString();
		const dueISO = form.dueDate
			? new Date(form.dueDate.setHours(12, 0, 0, 0)).toISOString()
			: null;

		const parsedTags: string[] = form.tagsInput
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);

		const clientid = `card-${uuidv4()}`;
		const optimisticCard: CardT = {
			__typename: "Card",
			id: clientid,
			columnId,
			boardId,
			title: form.title.trim(),
			description: form.description.trim() || null,
			order: nextOrder,
			assignedTo: form.assignedTo.trim() || null,
			dueDate: dueISO,
			completed: form.completed,
			tags: parsedTags,
			createdAt: now,
			updatedAt: now,
		};

		setSubmitting(true);
		try {
			await client.mutate<{ addCard: CardT }>({
				mutation: ADD_CARD,
				variables: {
					boardId,
					columnId,
					title: optimisticCard.title,
					description: optimisticCard.description,
					assignedTo: optimisticCard.assignedTo,
					dueDate: optimisticCard.dueDate,
					completed: optimisticCard.completed,
					tags: parsedTags,
				},
				optimisticResponse: { addCard: optimisticCard },
				update(cache, { data }) {
					const newCard = data?.addCard;

					if (!newCard) {
						console.log("No new card data received. Cache not updated.");
						return;
					}

					console.log(
						`Adding new card with ID ${newCard.id} to cache for column ID ${newCard.columnId}`
					);

					cache.modify({
						id: cache.identify({ __typename: "Column", id: newCard.columnId }),
						fields: {
							cards(existingCards = []) {
								const newCardRef = cache.writeFragment({
									data: newCard,
									fragment: CARD_FIELDS,
									fragmentName: "CardFields",
								});

								if (
									existingCards.some(
										(ref: Reference) => ref.__ref === newCardRef?.__ref
									)
								) {
									console.log(
										"Optimistic card already exists. No new reference added."
									);
									return existingCards;
								}

								console.log(
									`Successfully added new card reference to the list. Current count: ${
										existingCards.length + 1
									}`
								);

								return [...existingCards, newCardRef];
							},
						},
					});
				},
			});

			resetAndClose();
		} catch (err) {
			console.error(err);
		} finally {
			setSubmitting(false);
		}
	}

	// Live preview of tags (first 10)
	const previewTags: string[] = form.tagsInput
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean)
		.slice(0, 10);

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
					<div className="grid gap-2">
						<Label htmlFor="title">Title</Label>
						<Input
							id="title"
							value={form.title}
							onChange={(e) =>
								setForm((f) => ({ ...f, title: e.target.value }))
							}
							placeholder="Write a clear task name"
							required
							disabled={submitting}
							className="focus-visible:ring-indigo-500"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="description">Description (optional)</Label>
						<Textarea
							id="description"
							value={form.description}
							onChange={(e) =>
								setForm((f) => ({ ...f, description: e.target.value }))
							}
							placeholder="Add context or checklists"
							disabled={submitting}
							className="min-h-[90px]"
						/>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="assignedTo">Assigned to (user ID)</Label>
							<Input
								id="assignedTo"
								value={form.assignedTo}
								onChange={(e) =>
									setForm((f) => ({ ...f, assignedTo: e.target.value }))
								}
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
										{form.dueDate ? (
											form.dueDate.toDateString()
										) : (
											<span>Pick a date</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="p-0" align="start">
									<Calendar
										mode="single"
										selected={form.dueDate}
										onSelect={(d) =>
											setForm((f) => ({ ...f, dueDate: d ?? undefined }))
										}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					{/* Completed toggle */}
					<div className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
						<div className="space-y-0.5">
							<div className="text-sm font-medium">Mark as completed</div>
							<div className="text-xs text-muted-foreground">
								You can change this later.
							</div>
						</div>
						<Switch
							checked={form.completed}
							onCheckedChange={(v) => setForm((f) => ({ ...f, completed: v }))}
							disabled={submitting}
						/>
					</div>

					{/* Tags */}
					<div className="space-y-2">
						<Label htmlFor="tags" className="flex items-center gap-1">
							<Tag className="h-4 w-4 opacity-70" />
							Tags (comma-separated)
						</Label>
						<Input
							id="tags"
							value={form.tagsInput}
							onChange={(e) =>
								setForm((f) => ({ ...f, tagsInput: e.target.value }))
							}
							placeholder="bug, urgent, design"
							disabled={submitting}
						/>
						{previewTags.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-1">
								{previewTags.map((t) => (
									<span
										key={t}
										className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs"
									>
										<Hash className="h-3 w-3 opacity-70" />
										{t}
									</span>
								))}
							</div>
						)}
					</div>

					<div className="flex justify-end gap-2 pt-2">
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
