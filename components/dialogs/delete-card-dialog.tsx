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
import { DELETE_CARD } from "@/graphql/card";

import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format-date";
import { Reference } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { AlertTriangle, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CardT } from "../kanban/types";
import { CARD_FIELDS } from "@/graphql/fragments";

type Props = {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	cardId: string;
	columnId: string;
	title?: string;
	dueDate?: string | null;
};

export default function DeleteCardDialog({
	open,
	onOpenChange,
	cardId,
	title,
	dueDate,
}: Props) {
	const client = useApolloClient();
	const [submitting, setSubmitting] = useState(false);

	async function onConfirm(): Promise<void> {
		if (submitting) return;
		setSubmitting(true);

		try {
			await client.mutate<{ deleteCard: boolean }>({
				mutation: DELETE_CARD,
				variables: { cardId },
				optimisticResponse: { deleteCard: true },
				update(cache) {
					// read the card data from the cache using a fragment.
					const deletedCard = cache.readFragment<CardT>({
						id: cache.identify({ __typename: "Card", id: cardId }),
						fragment: CARD_FIELDS,
						fragmentName: "CardFields",
					});

					if (!deletedCard) {
						console.log(
							"Deleted card not found in cache. Cache update aborted."
						);
						return;
					}

					const columnId = deletedCard.columnId;

					cache.modify({
						id: cache.identify({ __typename: "Column", id: columnId }),
						fields: {
							cards(existingCards = [], { readField }) {
								const newCards = existingCards.filter(
									(cardRef: Reference) => readField("id", cardRef) !== cardId
								);

								return newCards;
							},
						},
					});

					cache.evict({
						id: cache.identify({ __typename: "Card", id: cardId }),
					});
					cache.gc();

					console.log("Card evicted from cache and garbage collected.");
				},
			});

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
			onOpenChange={(v) => !submitting && onOpenChange(v)}
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
								You’re about to delete{" "}
								<span className="font-medium">“{title}”</span>. This can’t be
								undone.
							</span>
						) : (
							"This action can’t be undone."
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
