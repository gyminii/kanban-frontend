"use client";

import Link from "next/link";

import type { BoardT, CardT } from "@/components/kanban/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DASHBOARD_BOARDS } from "@/graphql/board";
import { GET_CARDS } from "@/graphql/card";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useApolloClient } from "@apollo/client/react";
import { CalendarDays, LayoutDashboard, List, Tag } from "lucide-react";
import { use, useCallback, useEffect, useState } from "react";

function formatDate(d?: string | null) {
	return d ? new Date(d).toLocaleDateString() : "—";
}
function daysUntil(date: Date) {
	const start = new Date();
	start.setHours(0, 0, 0, 0);
	const end = new Date(date);
	end.setHours(0, 0, 0, 0);
	return Math.ceil((end.getTime() - start.getTime()) / 86400000);
}

type ItemsT = (CardT & { boardId: string; boardTitle: string })[];
const supabase = createClient();
const userPromise = supabase.auth.getUser();
export default function TasksSection() {
	const client = useApolloClient();
	const {
		data: { user },
	} = use(userPromise);
	const userId = user?.id;
	const [boards, setBoards] = useState<BoardT[]>([]);
	const [selectedBoard, setSelectedBoard] = useState<string>("all");
	const [view, setView] = useState<"cards" | "list">("cards");
	const [items, setItems] = useState<ItemsT>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				setLoading(true);
				const { data } = await client.query<{ boards: BoardT[] }>({
					query: DASHBOARD_BOARDS,
					variables: { userId },
					fetchPolicy: "network-only",
				});
				if (!mounted) return;
				const nonArchived = (data?.boards ?? []).filter((b) => !b.isArchived);
				setBoards(nonArchived);
			} catch (e) {
				console.error("Failed to load boards:", e);
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [client, userId]);

	const refetchTasks = useCallback(
		async (boardId: string | null) => {
			const { data } = await client.query<{ getCards: CardT[] }>({
				query: GET_CARDS,
				variables: { userId, boardId },
				fetchPolicy: "network-only",
			});

			const lookup = new Map(boards.map((b) => [b.id, b.title]));
			const next: ItemsT = (data?.getCards ?? [])
				.filter((c) => !c.boardId || lookup.has(c.boardId))
				.map((c) => ({
					...c,
					boardId: c.boardId!,
					boardTitle: lookup.get(c.boardId!) ?? "Unknown Board",
				}))
				.sort(
					(a, b) =>
						new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
				);

			setItems(next);
		},
		[client, userId, boards]
	);

	useEffect(() => {
		if (!boards.length) return;
		refetchTasks(null);
	}, [boards, refetchTasks]);

	const onBoardChange = useCallback(
		async (val: string) => {
			setSelectedBoard(val);
			await refetchTasks(val === "all" ? null : val);
		},
		[refetchTasks]
	);

	const filtered =
		selectedBoard === "all"
			? items
			: items.filter((t) => t.boardId === selectedBoard);
	const count = filtered.length;

	return (
		<section className="rounded-2xl border shadow-md bg-gradient-to-b from-indigo-50/40 to-background dark:from-indigo-950/20 dark:to-card">
			<Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
				{/* Header */}
				<div className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-2">
						<span className="text-sm font-semibold">Tasks</span>
						<Badge variant="secondary">{loading ? "…" : count}</Badge>
					</div>

					<div className="flex gap-3 items-center">
						<Select value={selectedBoard} onValueChange={onBoardChange}>
							<SelectTrigger className="w-48 h-8 text-xs">
								<SelectValue placeholder="Filter by board" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Boards</SelectItem>
								{boards.map((b) => (
									<SelectItem key={b.id} value={b.id}>
										{b.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* View toggle */}
						<TabsList className="h-8">
							<TabsTrigger value="cards" className="gap-1">
								<LayoutDashboard className="h-3.5 w-3.5" />
								Cards
							</TabsTrigger>
							<TabsTrigger value="list" className="gap-1">
								<List className="h-3.5 w-3.5" />
								List
							</TabsTrigger>
						</TabsList>
					</div>
				</div>

				{/* Content */}
				<div className="px-3 pb-3 pt-2">
					{loading ? (
						<div className="px-8 py-10 text-center text-sm text-muted-foreground">
							Loading…
						</div>
					) : (
						<>
							{/* Card view */}
							<TabsContent value="cards" className="m-0">
								{count === 0 ? (
									<EmptyState boardId={selectedBoard} />
								) : (
									<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
										{filtered.map((t) => (
											<Link
												key={t.id}
												href={`/boards/${t.boardId}`}
												className={cn(
													"group rounded-xl border bg-background px-3 py-3 transition-colors",
													"hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30"
												)}
											>
												<div className="flex items-start justify-between gap-3">
													<div className="min-w-0">
														<div
															className={cn(
																"text-sm font-medium truncate",
																t.completed
																	? "text-neutral-500 line-through"
																	: "text-foreground"
															)}
															title={t.title}
														>
															{t.title}
														</div>

														<div className="mt-0.5 text-xs text-muted-foreground truncate">
															{t.boardTitle}
															{t.description ? ` — ${t.description}` : ""}
														</div>

														{Array.isArray(
															(t as unknown as { tags?: string[] }).tags
														) &&
														(t as unknown as { tags?: string[] }).tags!
															.length ? (
															<div className="mt-2 flex flex-wrap gap-1">
																{(t as unknown as { tags: string[] }).tags
																	.slice(0, 6)
																	.map((tag) => (
																		<Badge
																			key={tag}
																			variant="outline"
																			className="h-5 rounded-full"
																		>
																			<Tag className="mr-1 h-3 w-3 opacity-70" />
																			{tag}
																		</Badge>
																	))}
																{(t as unknown as { tags: string[] }).tags
																	.length > 6 ? (
																	<Badge
																		variant="outline"
																		className="h-5 rounded-full"
																	>
																		+
																		{(t as unknown as { tags: string[] }).tags
																			.length - 6}
																	</Badge>
																) : null}
															</div>
														) : null}
													</div>

													<div className="shrink-0 text-right">
														<DueBadge
															completed={!!t.completed}
															dueDate={t.dueDate ?? null}
														/>
														<div className="mt-1 text-[11px] text-muted-foreground">
															Updated {formatDate(t.updatedAt)}
														</div>
													</div>
												</div>
											</Link>
										))}
									</div>
								)}
							</TabsContent>

							{/* List view */}
							<TabsContent value="list" className="m-0">
								{count === 0 ? (
									<EmptyState boardId={selectedBoard} />
								) : (
									<div className="overflow-x-auto rounded-xl border">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className="w-[40%]">Task</TableHead>
													<TableHead>Board</TableHead>
													<TableHead className="whitespace-nowrap">
														Due
													</TableHead>
													<TableHead className="whitespace-nowrap">
														Status
													</TableHead>
													<TableHead className="whitespace-nowrap">
														Tags
													</TableHead>
													<TableHead className="text-right">Updated</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{filtered.map((t) => {
													const tags =
														(t as unknown as { tags?: string[] }).tags ?? [];
													return (
														<TableRow
															key={t.id}
															className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20"
														>
															<TableCell className="max-w-[420px]">
																<Link
																	href={`/boards/${t.boardId}`}
																	className="font-medium hover:underline"
																>
																	{t.title}
																</Link>
																{t.description ? (
																	<div className="line-clamp-1 text-xs text-muted-foreground">
																		{t.description}
																	</div>
																) : null}
															</TableCell>
															<TableCell className="text-sm text-muted-foreground">
																{t.boardTitle}
															</TableCell>
															<TableCell className="text-sm">
																<DueBadge
																	inline
																	completed={!!t.completed}
																	dueDate={t.dueDate ?? null}
																/>
															</TableCell>
															<TableCell>
																{t.completed ? (
																	<Badge
																		variant="secondary"
																		className="rounded-full"
																	>
																		Done
																	</Badge>
																) : (
																	<Badge className="rounded-full bg-indigo-600 text-white">
																		Open
																	</Badge>
																)}
															</TableCell>
															<TableCell className="text-sm">
																{tags.length ? (
																	<span className="inline-flex items-center gap-1 text-muted-foreground">
																		<Tag className="h-3.5 w-3.5" />
																		{tags.length}
																	</span>
																) : (
																	"—"
																)}
															</TableCell>
															<TableCell className="text-right text-xs text-muted-foreground">
																{formatDate(t.updatedAt)}
															</TableCell>
														</TableRow>
													);
												})}
											</TableBody>
										</Table>
									</div>
								)}
							</TabsContent>
						</>
					)}
				</div>
			</Tabs>
		</section>
	);
}

function EmptyState({ boardId }: { boardId: string }) {
	const isAll = !boardId || boardId === "all";
	return (
		<div className="px-8 py-12 text-center text-sm text-muted-foreground">
			<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border">
				<LayoutDashboard className="h-5 w-5 opacity-70" />
			</div>

			{isAll ? (
				<>
					<div>No tasks assigned to you across all boards.</div>
					<div className="mt-1 text-xs">
						Choose a specific board to jump in.
					</div>
				</>
			) : (
				<>
					<div>No tasks assigned to you in this board.</div>
					<div className="mt-4">
						<Button
							asChild
							className="bg-indigo-600 text-white hover:bg-indigo-600/90"
						>
							<Link href={`/boards/${boardId}`}>Go to Project</Link>
						</Button>
					</div>
				</>
			)}
		</div>
	);
}

function DueBadge({
	dueDate,
	completed,
	inline,
}: {
	dueDate: string | null;
	completed: boolean;
	inline?: boolean;
}) {
	if (!dueDate) return <span className={cn(inline && "text-sm")}>—</span>;
	const d = new Date(dueDate);
	const left = daysUntil(d);
	const tone = completed
		? "outline"
		: left < 0
		? "destructive"
		: left === 0
		? "default"
		: "outline";

	return (
		<div
			className={cn("flex items-center justify-end", inline && "justify-start")}
		>
			<Badge
				variant={tone === "default" ? "default" : "outline"}
				className={cn(
					"rounded-full",
					tone === "default" && "bg-indigo-600 text-white",
					tone === "destructive" &&
						"border-rose-300 text-rose-700 dark:border-rose-900 dark:text-rose-300"
				)}
			>
				<CalendarDays className="mr-1 h-3.5 w-3.5" />
				{formatDate(dueDate)}
			</Badge>
			{!completed && (
				<span className="ml-2 text-[11px] text-muted-foreground">
					{left < 0
						? `Overdue ${Math.abs(left)}d`
						: left === 0
						? "Today"
						: `${left}d`}
				</span>
			)}
		</div>
	);
}
