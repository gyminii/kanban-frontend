"use client";

import * as React from "react";
import { useApolloClient } from "@apollo/client/react";
import { CalendarIcon, Hash, Tag } from "lucide-react";
import { toast } from "sonner";
import { UPDATE_CARD } from "@/graphql/card";
import type { CardT } from "@/components/kanban/types";

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
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	card: CardT;
};

type UpdateCardPayload = {
	updateCard: CardT;
};

type FormState = {
	title: string;
	description: string;
	dueDate?: Date;
	completed: boolean;
	tagsInput: string; // comma-separated tags
};

export default function EditCardDialog({ open, onOpenChange, card }: Props) {
	const client = useApolloClient();
	const [submitting, setSubmitting] = React.useState(false);

	const [form, setForm] = React.useState<FormState>(() => ({
		title: card.title ?? "",
		description: card.description ?? "",
		dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
		completed: !!card.completed,
		tagsInput: (card.tags ?? []).join(", "),
	}));

	React.useEffect(() => {
		if (!open) return;
		setForm({
			title: card.title ?? "",
			description: card.description ?? "",
			dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
			completed: !!card.completed,
			tagsInput: (card.tags ?? []).join(", "),
		});
	}, [open, card]);

	function resetAndClose(): void {
		onOpenChange(false);
	}

	async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
		e.preventDefault();
		if (!form.title.trim() || submitting) return;

		const updatedAt = new Date().toISOString();
		const dueISO = form.dueDate
			? new Date(form.dueDate.setHours(12, 0, 0, 0)).toISOString()
			: null;

		const parsedTags: string[] = form.tagsInput
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);

		setSubmitting(true);
		try {
			const res = await client.mutate<UpdateCardPayload>({
				mutation: UPDATE_CARD,
				variables: {
					cardId: card.id,
					title: form.title || null,
					description: form.description || null,
					assignedTo: null, // unchanged by this dialog/UI
					dueDate: dueISO,
					completed: form.completed,
					tags: parsedTags.length ? parsedTags : [],
				},
				optimisticResponse: {
					updateCard: {
						__typename: "Card",
						id: card.id,
						columnId: card.columnId,
						title: form.title,
						description: form.description || null,
						order: card.order,
						assignedTo: card.assignedTo ?? null,
						dueDate: dueISO,
						completed: form.completed,
						tags: parsedTags,
						createdAt: card.createdAt,
						updatedAt,
					},
				},
				update(cache, { data }) {
					const next = data?.updateCard;
					const entityId = cache.identify({ __typename: "Card", id: card.id });
					if (!entityId) return;

					cache.modify({
						id: entityId,
						fields: {
							title: () => (next ? next.title : form.title),
							description: () =>
								next ? next.description : form.description || null,
							dueDate: () => (next ? next.dueDate : dueISO),
							completed: () => (next ? next.completed : form.completed),
							tags: () => (next ? next.tags : parsedTags),
							updatedAt: () => (next ? next.updatedAt : updatedAt),
						},
					});
				},
			});

			if (!res.data?.updateCard) {
				throw new Error("No card returned");
			}

			toast.success("Card updated");
			resetAndClose();
		} catch {
			toast.error("Failed to update card");
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
						Edit task
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={onSubmit} className="space-y-4">
					{/* Title */}
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

					{/* Description */}
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
							className="min-h-[96px]"
						/>
					</div>

					{/* Due date + Completed */}
					<div className="grid gap-4 sm:grid-cols-2">
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

						<div className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
							<div className="space-y-0.5">
								<div className="text-sm font-medium">Mark as completed</div>
								<div className="text-xs text-muted-foreground">
									You can change this later.
								</div>
							</div>
							<Switch
								checked={form.completed}
								onCheckedChange={(v) =>
									setForm((f) => ({ ...f, completed: v }))
								}
								disabled={submitting}
							/>
						</div>
					</div>

					{/* Tags (comma-separated) */}
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
							disabled={submitting}
						>
							{submitting ? "Saving…" : "Save changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
