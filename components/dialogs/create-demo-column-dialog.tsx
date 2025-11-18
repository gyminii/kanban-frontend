"use client";

import { KanbanSquare } from "lucide-react";
import { toast } from "sonner";

import { useDemoStore } from "@/utils/demo/store";

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
import { FormEvent, useState } from "react";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function CreateDemoColumnDialog({ open, onOpenChange }: Props) {
	const addColumn = useDemoStore((state) => state.addColumn);
	const [submitting, setSubmitting] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	function resetAndClose() {
		setTitle("");
		setDescription("");
		onOpenChange(false);
	}

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const trimmedTitle = title.trim();
		if (!trimmedTitle || submitting) return;

		setSubmitting(true);
		try {
			addColumn(trimmedTitle, description.trim() || undefined);
			toast.success("Column created");
			resetAndClose();
		} catch {
			toast.error("Failed to create column");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
			<DialogContent className="sm:max-w-lg">
				{/* Header */}
				<DialogHeader className="space-y-1">
					<div className="flex items-center gap-2">
						<KanbanSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
						<DialogTitle>Create new column</DialogTitle>
					</div>
					<DialogDescription className="text-sm">
						Add a new column to organize your tasks
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={onSubmit} className="space-y-4">
					{/* Column name */}
					<div className="space-y-2">
						<Label htmlFor="title">Column name</Label>
						<Input
							id="title"
							name="title"
							placeholder="e.g., To Do, In Progress, Done"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
							disabled={submitting}
							autoFocus
						/>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="description">Description (optional)</Label>
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
							disabled={submitting}
						>
							{submitting ? "Creating..." : "Create column"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
