"use client";

import KanbanCanvas from "@/components/kanban/canvas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { BOARD_QUERY, UPDATE_BOARD } from "@/graphql/board";
import { useBoardDnd } from "@/hooks/use-board-dnd";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format-date";
import { useSettings } from "@/utils/settings/provider";
import { useApolloClient } from "@apollo/client/react";
import { Archive, Hash, Paintbrush, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NewColumnButton } from "../new-column-button";
import BoardMenu from "./board-menu";

const SUGGESTED_COLORS = [
	"#4f46e5", // indigo
	"#22c55e", // green
	"#06b6d4", // cyan
	"#f97316", // orange
	"#ef4444", // red
];

// utility: map hex to Tailwind classes
function accentClass(hex: string) {
	return cn(
		hex === "#4f46e5" && "text-indigo-600 dark:text-indigo-400",
		hex === "#22c55e" && "text-green-600 dark:text-green-400",
		hex === "#06b6d4" && "text-cyan-600 dark:text-cyan-400",
		hex === "#f97316" && "text-orange-600 dark:text-orange-400",
		hex === "#ef4444" && "text-red-600 dark:text-red-400"
	);
}

function bgClass(hex: string) {
	return cn(
		hex === "#4f46e5" && "bg-indigo-600",
		hex === "#22c55e" && "bg-green-600",
		hex === "#06b6d4" && "bg-cyan-600",
		hex === "#f97316" && "bg-orange-600",
		hex === "#ef4444" && "bg-red-600"
	);
}

export default function BoardView() {
	const { board } = useBoardDnd();
	const client = useApolloClient();
	const { update } = useSettings();
	const totalCards = board?.columns.reduce((n, c) => n + c?.cards?.length, 0);
	const accent = board?.color || "#4f46e5";
	const tags = (board?.tags ?? []).slice(0, 10);
	useEffect(() => {
		if (board?.id) {
			void update({ lastBoardId: board.id });
		}
	}, [board?.id, update]);

	async function toggleFavorite() {
		const id = client.cache.identify({ __typename: "Board", id: board.id });
		const prev = !!board.isFavorite;
		if (id) client.cache.modify({ id, fields: { isFavorite: () => !prev } });

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

	async function changeColor(newColor: string) {
		const id = client.cache.identify({ __typename: "Board", id: board.id });
		if (id) client.cache.modify({ id, fields: { color: () => newColor } });

		try {
			await client.mutate({
				mutation: UPDATE_BOARD,
				variables: { boardId: board.id, color: newColor },
				refetchQueries: [
					{ query: BOARD_QUERY, variables: { boardId: board.id } },
				],
			});
		} catch {
			if (id) client.cache.modify({ id, fields: { color: () => accent } });
			toast.error("Failed to update color");
		}
	}
	return (
		<div className="flex-1 overflow-hidden  h-full min-h-0 min-w-0 flex-col p-4">
			{/* Header card */}
			<div
				className="mb-4 rounded-2xl border bg-white/90 shadow-sm backdrop-blur dark:bg-neutral-950/70 overflow-hidden"
				style={{
					background:
						`linear-gradient(180deg, ${accent}10, transparent 55%),` +
						`radial-gradient(600px 160px at 0% -10%, ${accent}0F, transparent 70%),` +
						`var(--background)`,
				}}
			>
				<div
					className="h-1.5 w-full"
					style={{
						background: `linear-gradient(90deg, ${accent}, ${accent}AA 40%, transparent 100%)`,
					}}
				/>

				<div className="relative p-4 sm:p-5">
					{/* top row */}
					<div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-2">
								{/* Title using cn */}
								<h1
									className={cn(
										"truncate text-2xl sm:text-3xl font-bold tracking-tight leading-normal pb-1",
										accentClass(accent)
									)}
								>
									{board?.title}
								</h1>

								{/* Favorite chip (clickable) */}
								<button
									type="button"
									onClick={toggleFavorite}
									aria-label={
										board?.isFavorite ? "Unfavorite board" : "Favorite board"
									}
									aria-pressed={board?.isFavorite}
									className="focus-visible:outline-none"
								>
									<Badge
										className={cn(
											"gap-1 select-none",
											board?.isFavorite
												? "bg-amber-500/95 text-white hover:bg-amber-500"
												: "border-amber-300 text-amber-600 hover:bg-amber-50 dark:text-amber-400"
										)}
										variant={board?.isFavorite ? "default" : "outline"}
									>
										<Star
											className={cn(
												"h-3.5 w-3.5",
												board?.isFavorite && "fill-current"
											)}
										/>
										Favorite
									</Badge>
								</button>

								{board?.isArchived ? (
									<Badge
										variant="outline"
										className="gap-1 text-neutral-700 dark:text-neutral-200"
									>
										<Archive className="h-3.5 w-3.5" />
										Archived
									</Badge>
								) : null}
							</div>

							{board?.description ? (
								<p className="mt-1 text-sm leading-6 text-neutral-700 dark:text-neutral-300/90">
									{board?.description}
								</p>
							) : null}
						</div>

						{/* actions */}
						<div className="flex items-center gap-2">
							<ColorPickerButton color={accent} onPick={changeColor} />
							<NewColumnButton boardId={board?.id} />
							<BoardMenu board={board} />
						</div>
					</div>

					{/* meta + tags */}
					<div className="relative z-10 mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
							<MetaBadge
								label="Columns"
								value={String(board?.columns.length)}
							/>
							<MetaBadge label="Cards" value={String(totalCards)} />
							<MetaBadge label="Updated" value={formatDate(board?.updatedAt)} />
						</div>

						<div className="min-w-0">
							{tags.length > 0 ? (
								<div className="flex max-w-full flex-wrap items-center gap-1.5">
									{tags.map((t) => (
										<span
											key={t}
											className="inline-flex items-center gap-1 rounded-full border bg-white/70 px-2 py-0.5 text-xs text-neutral-700 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-200"
											title={t}
										>
											<Hash className="h-3.5 w-3.5 opacity-70" />
											{t}
										</span>
									))}
									{(board?.tags?.length ?? 0) > tags.length ? (
										<span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-neutral-500 dark:border-neutral-800">
											+{(board?.tags?.length ?? 0) - tags.length} more
										</span>
									) : null}
								</div>
							) : (
								<div className="text-xs text-neutral-400">
									Add tags in &quot;Edit board&quot; to help filter/search.
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Canvas */}
			<div
				className={cn(
					"flex-1 min-h-0 rounded-2xl border",
					"bg-[radial-gradient(1200px_400px_at_0%_-20%,rgba(99,102,241,0.06),transparent),linear-gradient(to_bottom,rgba(0,0,0,0.02),transparent)]",
					"dark:bg-[radial-gradient(1200px_400px_at_0%_-20%,rgba(99,102,241,0.12),transparent),linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent)]"
				)}
				style={{ boxShadow: `inset 0 1px 0 0 ${accent}1a` }}
			>
				<div className="h-full w-full rounded-2xl p-2 sm:p-3">
					<KanbanCanvas />
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

/** Color picker button (no hex text; opens a popover). */
function ColorPickerButton({
	color,
	onPick,
}: {
	color: string;
	onPick: (hex: string) => void;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="gap-2"
					title="Change board color"
				>
					<span
						className={cn("h-3.5 w-3.5 rounded-md border", bgClass(color))}
						aria-hidden
					/>
					<Paintbrush className="h-3.5 w-3.5 opacity-70" />
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-56 space-y-3" align="end">
				<div className="text-xs font-medium">Accent color</div>

				<div className="flex flex-wrap gap-2">
					{SUGGESTED_COLORS.map((c) => (
						<button
							key={c}
							type="button"
							onClick={() => onPick(c)}
							className={cn("h-7 w-7 rounded-md border shadow-sm", bgClass(c))}
							aria-label={`Use ${c}`}
							title={c}
						/>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
