"use client";

import KanbanCanvas from "@/components/kanban/canvas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBoardDnd } from "@/hooks/use-board-dnd";
import { formatDate } from "@/utils/format-date";
import { NewColumnButton } from "../new-column-button";
import BoardMenu from "./board-menu";
import { Star, Archive, Hash, Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApolloClient } from "@apollo/client/react";
import { UPDATE_BOARD, BOARD_QUERY } from "@/graphql/board";
import { toast } from "sonner";

export default function BoardView() {
	const { board, onDragEnd } = useBoardDnd();
	const client = useApolloClient();

	const totalCards = board.columns.reduce((n, c) => n + c.cards.length, 0);
	const accent = board.color || "#4f46e5";
	const tags = (board.tags ?? []).slice(0, 10);

	async function toggleFavorite() {
		const id = client.cache.identify({ __typename: "Board", id: board.id });
		const prev = !!board.isFavorite;

		if (id) {
			client.cache.modify({ id, fields: { isFavorite: () => !prev } });
		}

		try {
			await client.mutate({
				mutation: UPDATE_BOARD,
				variables: { boardId: board.id, isFavorite: !prev },
				refetchQueries: [
					{ query: BOARD_QUERY, variables: { boardId: board.id } },
				],
			});
		} catch {
			if (id) client.cache.modify({ id, fields: { isFavorite: () => prev } });
			toast.error("Failed to update favorite");
		}
	}

	return (
		<div className="flex h-full min-h-0 min-w-0 flex-col p-4">
			{/* Header card */}
			<div className="mb-4 rounded-2xl border bg-white/90 shadow-sm backdrop-blur dark:bg-neutral-950/70">
				<div
					className="h-1.5 w-full rounded-t-2xl"
					style={{
						background: `linear-gradient(90deg, ${accent} 0%, ${accent}99 40%, transparent 100%)`,
					}}
				/>
				<div className="flex flex-col gap-4 p-4 sm:p-5">
					{/* title + actions */}
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-2">
								<h1 className="truncate text-xl font-bold tracking-tight text-indigo-700 dark:text-indigo-400 sm:text-2xl">
									{board.title}
								</h1>

								{/* Favorite chip (clickable) */}
								<button
									type="button"
									onClick={toggleFavorite}
									aria-label={
										board.isFavorite ? "Unfavorite board" : "Favorite board"
									}
									aria-pressed={board.isFavorite}
									className="focus:outline-none"
								>
									<Badge
										className={cn(
											"gap-1 select-none",
											board.isFavorite
												? "bg-amber-500/90 text-white hover:bg-amber-500"
												: "border-amber-300 text-amber-600 hover:bg-amber-50 dark:text-amber-400"
										)}
										variant={board.isFavorite ? "default" : "outline"}
									>
										<Star
											className={cn(
												"h-3.5 w-3.5",
												board.isFavorite && "fill-current"
											)}
										/>
										Favorite
									</Badge>
								</button>

								{board.isArchived ? (
									<Badge
										variant="outline"
										className="gap-1 text-neutral-700 dark:text-neutral-200"
									>
										<Archive className="h-3.5 w-3.5" />
										Archived
									</Badge>
								) : null}
							</div>

							{/* Description in header */}
							{board.description ? (
								<p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">
									{board.description}
								</p>
							) : null}
						</div>

						<div className="flex items-center gap-2">
							<ColorChip color={accent} />
							<NewColumnButton boardId={board.id} />
							<BoardMenu board={board} />
						</div>
					</div>

					{/* stats + tags */}
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
							<MetaBadge label="Columns" value={String(board.columns.length)} />
							<MetaBadge label="Cards" value={String(totalCards)} />
							<MetaBadge label="Updated" value={formatDate(board.updatedAt)} />
						</div>

						{tags.length > 0 ? (
							<div className="flex flex-wrap items-center gap-1.5">
								{tags.map((t) => (
									<span
										key={t}
										className="inline-flex items-center gap-1 rounded-md border bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
										title={t}
									>
										<Hash className="h-3.5 w-3.5 opacity-70" />
										{t}
									</span>
								))}
								{(board.tags?.length ?? 0) > tags.length ? (
									<span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-neutral-500 dark:border-neutral-800">
										+{(board.tags?.length ?? 0) - tags.length} more
									</span>
								) : null}
							</div>
						) : (
							<div className="text-xs text-neutral-400">
								Add tags in “Edit board” to help filter/search.
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Canvas surface */}
			<div
				className={cn(
					"flex-1 min-h-0 rounded-2xl border",
					"bg-[radial-gradient(1200px_400px_at_0%_-20%,rgba(99,102,241,0.06),transparent),linear-gradient(to_bottom,rgba(0,0,0,0.02),transparent)]",
					"dark:bg-[radial-gradient(1200px_400px_at_0%_-20%,rgba(99,102,241,0.12),transparent),linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent)]"
				)}
				style={{ boxShadow: `inset 0 1px 0 0 ${accent}1a` }}
			>
				<div className="h-full w-full rounded-2xl p-2 sm:p-3">
					<KanbanCanvas columns={board.columns ?? []} onDragEnd={onDragEnd} />
				</div>
			</div>
		</div>
	);
}

function MetaBadge({ label, value }: { label: string; value: string }) {
	return (
		<Badge variant="outline" className="gap-1">
			<span className="opacity-70">{label}:</span>
			<span className="font-medium">{value}</span>
		</Badge>
	);
}

function ColorChip({ color }: { color: string }) {
	return (
		<Button variant="outline" size="sm" className="gap-2">
			<span
				className="h-3.5 w-3.5 rounded-md border"
				style={{ background: color }}
				aria-hidden
			/>
			<Paintbrush className="h-3.5 w-3.5 opacity-70" />
			<span className="hidden sm:inline text-xs">{color}</span>
		</Button>
	);
}
