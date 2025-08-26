"use client";

import { useRouter } from "next/navigation";
// import { getClient } from "@/utils/apollo/server";

import { CREATE_BOARD } from "@/graphql/board";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApolloClient } from "@apollo/client/react";

export default function CreateBoardDialog({ userId }: { userId: string }) {
	const router = useRouter();
	const client = useApolloClient();

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const title = String(fd.get("title") || "").trim();
		if (!title) return;

		try {
			const { data } = await client.mutate<{ createBoard: { id: string } }>({
				mutation: CREATE_BOARD,
				variables: { title, ownerId: userId },
			});

			const id = data?.createBoard?.id;
			router.replace(id ? `/boards/${id}` : "/");
		} catch {
			router.replace("/");
		}
	}

	return (
		<Dialog open>
			<DialogContent
				onPointerDownOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
				className="sm:max-w-md"
			>
				<DialogHeader>
					<DialogTitle className="text-indigo-700 dark:text-indigo-400">
						Create your first project
					</DialogTitle>
					<DialogDescription>
						You don’t have any projects yet. Create one to get started.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={onSubmit} className="space-y-4">
					<div className="grid gap-2">
						<Label htmlFor="title">Project name</Label>
						<Input
							id="title"
							name="title"
							placeholder="e.g., Sprint Board, Personal Kanban"
							className="focus-visible:ring-indigo-500"
							required
						/>
					</div>

					<div className="flex justify-end pt-2">
						<Button
							type="submit"
							className="bg-indigo-600 hover:bg-indigo-700 text-white"
						>
							Create project
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
