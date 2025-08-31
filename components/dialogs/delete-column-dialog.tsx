"use client";

import * as React from "react";
import { useApolloClient } from "@apollo/client/react";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { DELETE_COLUMN } from "@/graphql/column";
import { BOARD_QUERY } from "@/graphql/board";

import { Button } from "@/components/ui/button";
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

type Props = {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	columnId: string;
	/** Optional niceties for the confirmation line */
	title?: string;
	cardCount?: number;
};

export default function DeleteColumnDialog({
	open,
	onOpenChange,
	columnId,
	title,
	cardCount,
}: Props) {
	const client = useApolloClient();
	const { boardId } = useParams<{ boardId: string }>();
	const [submitting, setSubmitting] = React.useState(false);

	async function onConfirm(): Promise<void> {
		if (submitting) return;
		setSubmitting(true);

		try {
			await client.mutate<{ deleteColumn: boolean }>({
				mutation: DELETE_COLUMN,
				variables: { columnId },
				optimisticResponse: { deleteColumn: true },
				update(cache) {
					const cacheId = cache.identify({
						__typename: "Column",
						id: columnId,
					});
					if (cacheId) cache.evict({ id: cacheId });
					cache.gc();
				},
				refetchQueries: [{ query: BOARD_QUERY, variables: { boardId } }],
				awaitRefetchQueries: true,
			});

			toast.success("Column deleted");
			onOpenChange(false);
		} catch {
			toast.error("Failed to delete column");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<AlertDialog
			open={open}
			onOpenChange={(v) => !submitting && onOpenChange(v)}
		>
			<AlertDialogContent className="sm:max-w-md">
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-red-500" />
						Delete column?
					</AlertDialogTitle>
					<AlertDialogDescription>
						{title ? (
							<span>
								You’re about to delete{" "}
								<span className="font-medium">“{title}”</span>
								{typeof cardCount === "number"
									? ` and its ${cardCount} card${cardCount === 1 ? "" : "s"}`
									: ""}
								. This can’t be undone.
							</span>
						) : (
							"This action can’t be undone."
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="rounded-md border border-red-200/60 bg-red-50/60 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
					Deleting a column removes it from the board. Cards will be removed
					from this view and reloaded on refresh.
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
