"use client";

import { CalendarIcon, Hash, Tag } from "lucide-react";
import { toast } from "sonner";
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
import { useDemoContext } from "@/utils/demo/context";
import { FormEvent, useEffect, useState } from "react";

type Props = {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	card: CardT;
};

type FormState = {
	title: string;
	description: string;
	dueDate?: Date;
	completed: boolean;
	tagsInput: string;
};

export default function EditDemoCardDialog({ open, onOpenChange, card }: Props) {
	const { updateCard } = useDemoContext();
	const [submitting, setSubmitting] = useState(false);

	const [form, setForm] = useState<FormState>(() => ({
		title: card.title ?? "",
		description: card.description ?? "",
		dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
		completed: !!card.completed,
		tagsInput: (card.tags ?? []).join(", "),
	}));

	useEffect(() => {
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

	async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
		e.preventDefault();
		if (!form.title.trim() || submitting) return;

		const dueISO: string | null = form.dueDate
			? new Date(form.dueDate.setHours(12, 0, 0, 0)).toISOString()
			: null;

		const parsedTags: string[] = form.tagsInput
			.split(",")
			.map((t: string) => t.trim())
			.filter(Boolean);

		setSubmitting(true);
		try {
			updateCard(card.id, {
				title: form.title.trim(),
				description: form.description.trim() || null,
				dueDate: dueISO,
				completed: form.completed,
				tags: parsedTags.length ? parsedTags : [],
			});

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
		.map((t: string) => t.trim())
		.filter(Boolean)
		.slice(0, 10);

	return (
		<Dialog open={open} onOpenChange={(v: boolean) => !submitting && onOpenChange(v)}>
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
								setForm((f: FormState) => ({ ...f, title: e.target.value }))
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
								setForm((f: FormState) => ({ ...f, description: e.target.value }))
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
										onSelect={(d?: Date) =>
											setForm((f: FormState) => ({ ...f, dueDate: d ?? undefined }))
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
								onCheckedChange={(v: boolean) =>
									setForm((f: FormState) => ({ ...f, completed: v }))
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
								setForm((f: FormState) => ({ ...f, tagsInput: e.target.value }))
							}
							placeholder="bug, urgent, design"
							disabled={submitting}
						/>
						{previewTags.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-1">
								{previewTags.map((t: string) => (
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
