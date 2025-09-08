"use client";

import type { BoardT } from "@/components/kanban/types";
import { cn } from "@/lib/utils";
import { LayoutGrid, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DASHBOARD_BOARDS } from "@/graphql/board";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import DeleteBoardDialog from "../dialogs/delete-board-dialog";
import EditBoardDialog from "../dialogs/edit-board-dialog";

type SupabaseUser = { id: string } | null;

/** Convert hex like #6366F1 to rgba(...) with given alpha (0..1). */
function hexToRgba(hex: string, alpha = 0.12) {
	const h = hex.replace("#", "");
	const bigint = parseInt(
		h.length === 3
			? h
					.split("")
					.map((c) => c + c)
					.join("")
			: h,
		16
	);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function BoardsList() {
	const supabase = createClient();
	const [user, setUser] = useState<SupabaseUser>(null);
	const [authLoading, setAuthLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const { data, error } = await supabase.auth.getUser();
				if (mounted) setUser(error ? null : data.user ?? null);
			} finally {
				if (mounted) setAuthLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deleteInfo, setDeleteInfo] = useState<{
		id: string;
		title?: string;
	} | null>(null);

	const [editOpen, setEditOpen] = useState(false);
	const [editBoard, setEditBoard] = useState<BoardT | null>(null);

	// --- data ---
	const { data, loading, error } = useQuery<{ boards: BoardT[] }>(
		DASHBOARD_BOARDS,
		{
			variables: { userId: user?.id },
			fetchPolicy: "cache-and-network",
			skip: !user, // wait until we know user
		}
	);

	const boards = (data?.boards ?? []).filter((b) => !b.isArchived);
	const sorted = useMemo(
		() =>
			[...boards].sort(
				(a, b) =>
					new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
			),
		[boards]
	);

	const isLoading = authLoading || (!user && !error) || loading;

	function CreateProjectButton() {
		const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
			if (isLoading) {
				e.preventDefault();
				e.stopPropagation();
			}
		};

		return (
			<Button
				size="sm"
				variant="outline"
				asChild
				className="h-7 gap-1 rounded-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
				title="Create project"
			>
				<Link
					href="/create-project"
					aria-disabled={isLoading}
					tabIndex={isLoading ? -1 : 0}
					onClick={handleClick}
					onMouseDown={(e) => {
						// prevent focus on disabled
						if (isLoading) e.preventDefault();
					}}
					className={cn(
						"inline-flex items-center",
						isLoading && "pointer-events-none opacity-60"
					)}
				>
					<Plus className="h-4 w-4" />
					New
				</Link>
			</Button>
		);
	}

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between px-3">
					<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Projects
					</div>
					<CreateProjectButton />
				</div>
				<div className="px-3 py-6 text-center text-xs text-muted-foreground">
					Loading projects...
				</div>
			</div>
		);
	}

	if (error) {
		console.error("Failed to fetch boards:", error);
		return (
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between px-3">
					<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Projects
					</div>
					<CreateProjectButton />
				</div>
				<div className="px-3 py-6 text-center text-xs text-rose-500">
					Failed to load projects.
				</div>
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col gap-2")}>
			{/* Header row */}
			<div className="flex items-center justify-between px-3">
				<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Projects
				</div>
				<CreateProjectButton />
			</div>

			{/* List */}
			<ScrollArea className="max-h-[38vh]">
				<ul className="mt-1 space-y-1 px-2 pb-2">
					{sorted.length === 0 ? (
						<li className="px-3 py-6 text-center text-xs text-muted-foreground">
							No projects yet.
						</li>
					) : (
						sorted.map((b) => {
							const color = b.color || "#6366F1";
							const cardCount =
								b?.columns?.reduce((n, c) => n + (c?.cards?.length ?? 0), 0) ??
								0;

							const backgroundTint = hexToRgba(color, 0.1); // soft bg
							const hoverTint = hexToRgba(color, 0.16); // hover bg
							const borderTint = hexToRgba(color, 0.28); // border
							console.log(color, b);
							return (
								<li key={b.id}>
									<div
										className={cn(
											"group grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 rounded-xl border px-3 py-2 transition-colors"
										)}
										style={{
											background: backgroundTint,
											borderColor: borderTint,
										}}
									>
										{/* Left: icon + title (clickable) */}
										<Link
											href={`/boards/${b.id}`}
											className="col-start-1 row-start-1 flex min-w-0 items-center gap-3"
											title={b.title}
										>
											<span
												className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
												style={{
													borderColor: borderTint,
													background: hexToRgba(color, 0.14),
												}}
											>
												<LayoutGrid className="h-3.5 w-3.5 opacity-70" />
											</span>

											<div className="min-w-0">
												<div className="truncate text-sm font-medium">
													{b.title}
												</div>
												<div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
													<span>{b?.columns?.length ?? 0} cols</span>
													<span>•</span>
													<span>{cardCount} cards</span>
												</div>
											</div>
										</Link>

										{/* Right: actions */}
										<div className="col-start-2 row-start-1 flex shrink-0 items-center">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
														title="More"
													>
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end" className="w-44">
													<DropdownMenuItem asChild>
														<Link href={`/boards/${b.id}`}>View</Link>
													</DropdownMenuItem>
													<DropdownMenuItem
														onSelect={() => {
															setEditBoard(b);
															setEditOpen(true);
														}}
														className="flex items-center gap-2"
													>
														<Pencil className="h-4 w-4" />
														Edit
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-rose-600"
														onSelect={() => {
															setDeleteInfo({ id: b.id, title: b.title });
															setDeleteOpen(true);
														}}
													>
														<Trash2 className="mr-2 h-4 w-4" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>

										{/* Bottom row: tags (so the menu never gets squeezed) */}
										{(b.tags?.length ?? 0) > 0 && (
											<div className="col-span-2 row-start-2 -mb-0.5 flex flex-wrap gap-1.5">
												{b.tags!.slice(0, 3).map((t) => (
													<Badge
														key={t}
														variant="outline"
														className="h-5 rounded-full px-2 text-[10px]"
														style={{ borderColor: borderTint }}
													>
														{t}
													</Badge>
												))}
												{b.tags!.length > 3 && (
													<Badge
														variant="outline"
														className="h-5 rounded-full px-2 text-[10px]"
														style={{ borderColor: borderTint }}
													>
														+{b.tags!.length - 3}
													</Badge>
												)}
											</div>
										)}
									</div>

									<style jsx>{`
										/* Subtle hover using inline CSS var fallback */
										li > div:hover {
											background: ${hoverTint};
										}
									`}</style>
								</li>
							);
						})
					)}
				</ul>
			</ScrollArea>

			{/* dialogs */}
			{deleteInfo && (
				<DeleteBoardDialog
					open={deleteOpen}
					onOpenChange={setDeleteOpen}
					boardId={deleteInfo.id}
					boardTitle={deleteInfo.title}
				/>
			)}

			{editBoard && (
				<EditBoardDialog
					open={editOpen}
					onOpenChange={setEditOpen}
					board={editBoard}
				/>
			)}
		</div>
	);
}
