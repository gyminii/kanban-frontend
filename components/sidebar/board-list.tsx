"use client";

import type { BoardT } from "@/components/kanban/types";
import { cn } from "@/lib/utils";
import { Folder, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
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
import { use, useMemo, useState } from "react";
import DeleteBoardDialog from "../dialogs/delete-board-dialog";
import EditBoardDialog from "../dialogs/edit-board-dialog";

const supabase = createClient();
const UserPromise = supabase.auth.getUser();

export function BoardsList() {
	const {
		data: { user },
	} = use(UserPromise);

	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deleteInfo, setDeleteInfo] = useState<{
		id: string;
		title?: string;
	} | null>(null);

	const [editOpen, setEditOpen] = useState(false);
	const [editBoard, setEditBoard] = useState<BoardT | null>(null);

	const { data, loading, error } = useQuery<{ boards: BoardT[] }>(
		DASHBOARD_BOARDS,
		{
			variables: { userId: user?.id },
			fetchPolicy: "cache-and-network",
			skip: !user,
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

	// Handle loading and error states for both the user and the query
	const isLoading = !user || loading;

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between px-3">
					<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Projects
					</div>
					<Button
						size="sm"
						variant="outline"
						disabled
						className="h-7 gap-1 rounded-full border-indigo-200 text-indigo-700 dark:border-indigo-900 dark:text-indigo-300"
					>
						<Plus className="h-4 w-4" />
						New
					</Button>
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
					<Button
						size="sm"
						variant="outline"
						disabled
						className="h-7 gap-1 rounded-full border-indigo-200 text-indigo-700 dark:border-indigo-900 dark:text-indigo-300"
					>
						<Plus className="h-4 w-4" />
						New
					</Button>
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
				<Button
					size="sm"
					variant="outline"
					asChild
					className="h-7 gap-1 rounded-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
					title="Create project"
				>
					<Link href="/create-project">
						<Plus className="h-4 w-4" />
						New
					</Link>
				</Button>
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
							const color = b.color || "#6366F1"; // fallback to indigo-500
							const cardCount =
								b?.columns?.reduce((n, c) => n + (c?.cards?.length ?? 0), 0) ??
								0;

							return (
								<li
									key={b.id}
									className={cn(
										"group flex items-center justify-between gap-2 rounded-xl border px-3 py-2",
										"bg-card hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30",
										"transition-colors"
									)}
								>
									<Link
										href={`/boards/${b.id}`}
										className="flex min-w-0 items-center gap-3"
										title={b.title}
									>
										{/* Colored dot + fallback icon */}
										<span
											className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
											style={{
												borderColor: `${color}40`,
												background:
													"linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0))",
											}}
										>
											<span
												className="absolute h-2.5 w-2.5 rounded-full"
												style={{ backgroundColor: color }}
											/>
											<Folder className="h-3.5 w-3.5 opacity-40" />
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

									{/* Actions */}
									<div className="flex shrink-0 items-center gap-2">
										{b.tags?.length ? (
											<Badge
												variant="outline"
												className="h-6 rounded-full text-[10px]"
											>
												{b.tags[0]}
												{b.tags.length > 1 ? ` +${b.tags.length - 1}` : ""}
											</Badge>
										) : null}

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
											<DropdownMenuContent align="end" className="w-40">
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
								</li>
							);
						})
					)}
				</ul>
			</ScrollArea>

			{/* --- dialogs --- */}
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
