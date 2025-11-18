"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format-date";
import { useDemoStore } from "@/utils/demo/store";
import { AlertTriangle, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	cardId: string;
	title?: string;
	dueDate?: string | null;
};

export default function DeleteDemoCardDialog({
	open,
	onOpenChange,
	cardId,
	title,
	dueDate,
}: Props) {
	const deleteCard = useDemoStore((state) => state.deleteCard);
	const [submitting, setSubmitting] = useState(false);

	async function onConfirm(): Promise<void> {
		if (submitting) return;
		setSubmitting(true);

		try {
			deleteCard(cardId);
			toast.success("Card deleted");
			onOpenChange(false);
		} catch {
			toast.error("Failed to delete card");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<AlertDialog
			open={open}
			onOpenChange={(v: boolean) => !submitting && onOpenChange(v)}
		>
			<AlertDialogContent className="sm:max-w-md">
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-red-500" />
						Delete task?
					</AlertDialogTitle>
					<AlertDialogDescription>
						{title ? (
							<span>
								You're about to delete{" "}
								<span className="font-medium">"{title}"</span>. This can't be
								undone.
							</span>
						) : (
							"This action can't be undone."
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div
					className={cn(
						"rounded-md border p-3 text-sm",
						"border-red-200/60 bg-red-50/60 text-red-800",
						"dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
					)}
				>
					Deleting this card will remove it from the board and any lists or
					views that include it.
					{dueDate ? (
						<div className="mt-2 flex items-center gap-1.5 text-xs opacity-80">
							<Clock className="h-3.5 w-3.5" />
							<span>Due: {formatDate(dueDate)}</span>
						</div>
					) : null}
				</div>

				<AlertDialogFooter className="gap-2 pt-2">
					<AlertDialogCancel asChild>
						<Button variant="outline" disabled={submitting}>
							Cancel
						</Button>
					</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button
							type="button"
							variant="destructive"
							onClick={onConfirm}
							disabled={submitting}
							className="min-w-[96px]"
						>
							{submitting ? "Deleting…" : "Delete"}
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
