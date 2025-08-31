"use client";

import * as React from "react";
import { useApolloClient } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";

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

import { DELETE_BOARD } from "@/graphql/board";

type Props = {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	boardId: string;
	boardTitle?: string;
};

export default function DeleteBoardDialog({
	open,
	onOpenChange,
	boardId,
	boardTitle,
}: Props) {
	const client = useApolloClient();
	const router = useRouter();
	const [submitting, setSubmitting] = React.useState(false);

	async function onConfirm() {
		if (submitting) return;
		setSubmitting(true);
		try {
			await client.mutate<{ deleteBoard: boolean }>({
				mutation: DELETE_BOARD,
				variables: { boardId },
				optimisticResponse: { deleteBoard: true },
				update(cache) {
					const id = cache.identify({ __typename: "Board", id: boardId });
					if (id) cache.evict({ id });
					cache.gc();
				},
			});
			toast.success("Board deleted");
			router.push("/dashboard");
		} catch {
			toast.error("Failed to delete board");
		} finally {
			setSubmitting(false);
			onOpenChange(false);
		}
	}

	return (
		<AlertDialog
			open={open}
			onOpenChange={(v) => !submitting && onOpenChange(v)}
		>
			<AlertDialogContent className="sm:max-w-lg">
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-red-500" />
						Delete board?
					</AlertDialogTitle>
					<AlertDialogDescription>
						{boardTitle ? (
							<>
								You’re about to delete{" "}
								<span className="font-medium">“{boardTitle}”</span>.{" "}
							</>
						) : null}
						This removes the board, all its columns, and all cards. This can’t
						be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="rounded-md border border-red-200/60 bg-red-50/70 p-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
					<b>Warning:</b> Deleting this board will also permanently remove all
					of its columns and cards. This action cannot be undone.
				</div>

				<AlertDialogFooter className="gap-2">
					<AlertDialogCancel asChild>
						<Button variant="outline" disabled={submitting}>
							Cancel
						</Button>
					</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button
							variant="destructive"
							onClick={onConfirm}
							disabled={submitting}
							className="min-w-[128px]"
						>
							{submitting ? (
								<span className="inline-flex items-center gap-2">
									<Trash2 className="h-4 w-4 animate-pulse" />
									Deleting…
								</span>
							) : (
								<span className="inline-flex items-center gap-2">
									<Trash2 className="h-4 w-4" />
									Delete
								</span>
							)}
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
