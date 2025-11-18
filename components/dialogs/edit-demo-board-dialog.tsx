"use client";

import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useDemoStore } from "@/utils/demo/store";

import { useEffect, useState } from "react";
import type { BoardT } from "../kanban/types";

type Props = {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	board: BoardT;
};

type FormState = {
	title: string;
	description: string;
	tagsInput: string;
};

export default function EditDemoBoardDialog({
	open,
	onOpenChange,
	board,
}: Props) {
	const updateBoard = useDemoStore((state) => state.updateBoard);
	const [submitting, setSubmitting] = useState(false);
	const [form, setForm] = useState<FormState>({
		title: board.title ?? "",
		description: board.description ?? "",
		tagsInput: (board.tags ?? []).join(", "),
	});

	useEffect(() => {
		if (!open) return;
		setForm({
			title: board.title ?? "",
			description: board.description ?? "",
			tagsInput: (board.tags ?? []).join(", "),
		});
	}, [open, board]);

	async function onSave() {
		if (submitting) return;
		setSubmitting(true);
		try {
			const parsedTags = form.tagsInput
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean);

			updateBoard({
				...board,
				title: form.title || board.title,
				description: form.description || null,
				tags: parsedTags,
				updatedAt: new Date().toISOString(),
			});

			toast.success("Board updated");
			onOpenChange(false);
		} catch {
			toast.error("Failed to update board");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<Pencil className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
						<DialogTitle>Edit board</DialogTitle>
					</div>
					<DialogDescription>
						Update the board details below
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Title */}
					<div className="space-y-2">
						<Label htmlFor="edit-title">Board name</Label>
						<Input
							id="edit-title"
							value={form.title}
							onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
							placeholder="My Board"
							disabled={submitting}
						/>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="edit-description">Description</Label>
						<Textarea
							id="edit-description"
							value={form.description}
							onChange={(e) =>
								setForm((f) => ({ ...f, description: e.target.value }))
							}
							placeholder="Optional board description"
							disabled={submitting}
							className="min-h-[96px]"
						/>
					</div>

					{/* Tags */}
					<div className="space-y-2">
						<Label htmlFor="edit-tags">Tags</Label>
						<Input
							id="edit-tags"
							value={form.tagsInput}
							onChange={(e) =>
								setForm((f) => ({ ...f, tagsInput: e.target.value }))
							}
							placeholder="tag1, tag2, tag3"
							disabled={submitting}
						/>
						<p className="text-xs text-muted-foreground">
							Separate tags with commas
						</p>
					</div>
				</div>

				<DialogFooter className="mt-6">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={submitting}
					>
						Cancel
					</Button>
					<Button
						onClick={onSave}
						disabled={submitting}
						className="bg-indigo-600 hover:bg-indigo-700"
					>
						{submitting ? "Saving..." : "Save changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
