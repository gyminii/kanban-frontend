import { createClient } from "@/utils/supabase/server";
import { getClient } from "@/utils/apollo/server";
import { DASHBOARD_BOARDS } from "@/graphql/board";
import type { BoardT, CardT, ColumnT } from "@/components/kanban/types";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TasksSection from "@/components/dashboard/tasks-section";

function formatDate(d?: string) {
	return d ? new Date(d).toLocaleDateString() : "";
}

function daysUntil(date: Date) {
	const start = new Date();
	start.setHours(0, 0, 0, 0);
	const end = new Date(date);
	end.setHours(0, 0, 0, 0);
	return Math.ceil((end.getTime() - start.getTime()) / 86400000);
}

export default async function DashboardPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) redirect("/login");

	const client = getClient();

	// Boards for right-hand widgets (favorites, recents, due soon, tags, etc.)
	const { data: boardsData } = await client.query<{ boards: BoardT[] }>({
		query: DASHBOARD_BOARDS,
		variables: { userId: user.id },
		fetchPolicy: "no-cache",
	});
	const boards = (boardsData?.boards ?? []).filter((b) => !b.isArchived);

	// Favorites / Recents
	const favoriteBoards = boards.filter((b) => !!b.isFavorite);
	const recentBoards = boards
		.slice()
		.sort(
			(a, b) =>
				new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
		);

	// Tag cloud (boards only)
	const tagCounts = boards.reduce<Record<string, number>>((acc, b) => {
		for (const t of b.tags ?? []) acc[t] = (acc[t] ?? 0) + 1;
		return acc;
	}, {});
	const tagCloud = Object.entries(tagCounts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 20);

	// Due soon (next 7 days) — Tasks & Columns (from boards tree)
	const now = new Date();
	const in7 = new Date(now.getTime() + 7 * 86400000);

	const upcomingCards = boards
		.flatMap((b) =>
			b.columns.flatMap((c) =>
				c.cards
					.filter(
						(card) =>
							!!card.dueDate && !card.completed && new Date(card.dueDate) <= in7
					)
					.map((card) => ({ card, boardId: b.id, boardTitle: b.title }))
			)
		)
		.sort(
			(a, b) =>
				new Date(a.card.dueDate!).getTime() -
				new Date(b.card.dueDate!).getTime()
		);
	const upcomingColumns = boards
		.flatMap(
			(b) =>
				b.columns
					.map((col) => {
						const dueRaw =
							(col as ColumnT & { dueDate?: string }).dueDate ??
							col.endDate ??
							null;
						return dueRaw
							? { col, dueRaw, boardId: b.id, boardTitle: b.title }
							: null;
					})
					.filter(Boolean) as {
					col: ColumnT;
					dueRaw: string;
					boardId: string;
					boardTitle: string;
				}[]
		)
		.filter(
			(x) =>
				new Date(x.dueRaw) <= in7 && (x.col.status ?? "active") !== "completed"
		)
		.sort(
			(a, b) => new Date(a.dueRaw).getTime() - new Date(b.dueRaw).getTime()
		);

	const displayName = user.user_metadata?.name || user.email || "Welcome back";

	return (
		<div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10 bg-muted/40">
			{/* Header */}
			<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
				<div>
					<div className="text-xs text-muted-foreground">
						{new Date().toLocaleDateString(undefined, {
							weekday: "long",
							month: "long",
							day: "numeric",
						})}
					</div>
					<h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
						{displayName}
					</h1>
					<div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
						<Badge variant="outline" className="rounded-full">
							Projects {boards.length}
						</Badge>
					</div>
				</div>

				<div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						className="border-indigo-300/60 hover:bg-indigo-50 dark:hover:bg-indigo-950"
						asChild
					>
						<Link href="/create-project">Create project</Link>
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
				{/* LEFT: My work + Favorites */}
				<div className="xl:col-span-2 space-y-6">
					{/* My work (client-side fetch & refetch on selection) */}
					<section className="rounded-2xl border shadow-md bg-gradient-to-b from-indigo-50/40 to-background dark:from-indigo-950/20 dark:to-card">
						<TasksSection />
					</section>

					{/* Favorites */}
					{favoriteBoards.length > 0 && (
						<section className="rounded-2xl border shadow-md bg-card">
							<div className="flex items-center justify-between px-4 py-3 border-b">
								<div className="flex items-center gap-2">
									<span className="text-sm font-semibold">Favorites</span>
									<Badge variant="secondary">{favoriteBoards.length}</Badge>
								</div>
							</div>
							<div className="grid gap-3 p-3 sm:grid-cols-2">
								{favoriteBoards.slice(0, 6).map((b) => {
									const cardCount = b.columns.reduce(
										(n, c) => n + c.cards.length,
										0
									);
									return (
										<Link
											key={b.id}
											href={`/boards/${b.id}`}
											className="group rounded-xl border px-3 py-2 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
										>
											<div className="flex items-start justify-between gap-2">
												<div className="min-w-0">
													<div className="font-medium truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
														{b.title}
													</div>
													{b.description ? (
														<div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
															{b.description}
														</div>
													) : null}
													{b.tags?.length ? (
														<div className="mt-1 flex flex-wrap gap-1">
															{b.tags.slice(0, 6).map((t) => (
																<Badge
																	key={t}
																	variant="outline"
																	className="h-5 rounded-full"
																>
																	{t}
																</Badge>
															))}
														</div>
													) : null}
												</div>
												<div className="shrink-0 flex flex-col items-end gap-1">
													<Badge variant="outline" className="rounded-full">
														Columns {b.columns.length}
													</Badge>
													<Badge className="rounded-full bg-indigo-600 text-white">
														Cards {cardCount}
													</Badge>
												</div>
											</div>
										</Link>
									);
								})}
							</div>
						</section>
					)}
				</div>

				{/* RIGHT: Due soon + Projects + Tag cloud */}
				<div className="space-y-6">
					{/* Due soon — Tasks */}
					<section className="rounded-2xl border shadow-md bg-card">
						<div className="flex items-center justify-between px-4 py-3 border-b">
							<div className="flex items-center gap-2">
								<span className="text-sm font-semibold">Due soon — Tasks</span>
								<Badge variant="secondary">{upcomingCards.length}</Badge>
							</div>
							<div className="text-xs text-muted-foreground">Next 7 days</div>
						</div>
						<div className="p-3 grid gap-2">
							{upcomingCards.length === 0 ? (
								<div className="px-2 py-6 text-center text-sm text-muted-foreground">
									Nothing due soon.
								</div>
							) : (
								upcomingCards
									.slice(0, 8)
									.map(({ card, boardId, boardTitle }) => {
										const d = new Date(card.dueDate!);
										const left = daysUntil(d);
										return (
											<Link
												key={card.id}
												href={`/boards/${boardId}`}
												className="rounded-lg border px-3 py-2 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
											>
												<div className="flex items-start justify-between gap-2">
													<div className="min-w-0">
														<div className="text-sm font-medium truncate">
															{card.title}
														</div>
														<div className="text-xs text-muted-foreground truncate">
															{boardTitle}
															{card.description ? ` — ${card.description}` : ""}
														</div>
													</div>
													<div className="shrink-0 text-right">
														<Badge variant="outline" className="rounded-full">
															{formatDate(card.dueDate!)}
														</Badge>
														<div className="mt-1 text-[11px] text-muted-foreground">
															{left < 0
																? `Overdue ${Math.abs(left)}d`
																: left === 0
																? "Today"
																: `${left}d`}
														</div>
													</div>
												</div>
											</Link>
										);
									})
							)}
						</div>
					</section>

					{/* Due soon — Columns */}
					<section className="rounded-2xl border shadow-md bg-card">
						<div className="flex items-center justify-between px-4 py-3 border-b">
							<div className="flex items-center gap-2">
								<span className="text-sm font-semibold">
									Due soon — Columns
								</span>
								<Badge variant="secondary">{upcomingColumns.length}</Badge>
							</div>
							<div className="text-xs text-muted-foreground">Next 7 days</div>
						</div>
						<div className="p-3 grid gap-2">
							{upcomingColumns.length === 0 ? (
								<div className="px-2 py-6 text-center text-sm text-muted-foreground">
									No columns ending soon.
								</div>
							) : (
								upcomingColumns
									.slice(0, 8)
									.map(({ col, dueRaw, boardId, boardTitle }) => {
										const d = new Date(dueRaw);
										const left = daysUntil(d);
										return (
											<Link
												key={col.id}
												href={`/boards/${boardId}`}
												className="rounded-lg border px-3 py-2 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
											>
												<div className="flex items-start justify-between gap-2">
													<div className="min-w-0">
														<div className="text-sm font-medium truncate">
															{col.title}
														</div>
														<div className="text-xs text-muted-foreground truncate">
															{boardTitle}
															{col.description ? ` — ${col.description}` : ""}
														</div>
													</div>
													<div className="shrink-0 text-right">
														<Badge variant="outline" className="rounded-full">
															{formatDate(dueRaw)}
														</Badge>
														<div className="mt-1 text-[11px] text-muted-foreground">
															{left < 0
																? `Overdue ${Math.abs(left)}d`
																: left === 0
																? "Today"
																: `${left}d`}
														</div>
													</div>
												</div>
											</Link>
										);
									})
							)}
						</div>
					</section>

					{/* Projects */}
					<section className="rounded-2xl border shadow-md bg-gradient-to-b from-background to-indigo-50/40 dark:from-card dark:to-indigo-950/20">
						<div className="flex items-center justify-between px-4 py-3 border-b">
							<div className="flex items-center gap-2">
								<span className="text-sm font-semibold">Projects</span>
								<Badge variant="secondary">{boards.length}</Badge>
							</div>
							<Button variant="outline" size="sm" asChild>
								<Link href="/create-project">Create</Link>
							</Button>
						</div>

						<div className="p-3 grid gap-3">
							{boards.length === 0 ? (
								<div className="px-2 py-8 text-center text-sm text-muted-foreground">
									You have no projects yet.
								</div>
							) : (
								recentBoards.slice(0, 8).map((b) => {
									const cardCount = b.columns.reduce(
										(n, c) => n + c.cards.length,
										0
									);
									return (
										<Link
											key={b.id}
											href={`/boards/${b.id}`}
											className="group rounded-xl border px-3 py-2 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
										>
											<div className="flex items-center justify-between gap-2">
												<div className="min-w-0">
													<div className="font-medium truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
														{b.title}
													</div>
													<div className="mt-0.5 text-xs text-muted-foreground">
														Updated: {formatDate(b.updatedAt)}
													</div>
													{b.tags?.length ? (
														<div className="mt-1 flex flex-wrap gap-1">
															{b.tags.slice(0, 6).map((t) => (
																<Badge
																	key={t}
																	variant="outline"
																	className="h-5 rounded-full"
																>
																	{t}
																</Badge>
															))}
														</div>
													) : null}
												</div>
												<div className="shrink-0 flex items-center gap-2">
													<Badge variant="outline" className="rounded-full">
														Columns {b.columns.length}
													</Badge>
													<Badge className="rounded-full bg-indigo-600 text-white">
														Cards {cardCount}
													</Badge>
												</div>
											</div>
										</Link>
									);
								})
							)}
						</div>
					</section>

					{/* Tag cloud */}
					{tagCloud.length > 0 && (
						<section className="rounded-2xl border shadow-md bg-card">
							<div className="px-4 py-3 border-b">
								<span className="text-sm font-semibold">Tags</span>
							</div>
							<div className="p-4 flex flex-wrap gap-2">
								{tagCloud.map(([tag, count]) => (
									<Badge
										key={tag}
										variant="outline"
										className="rounded-full"
										title={`${count} project${count === 1 ? "" : "s"}`}
									>
										{tag} <span className="ml-1 opacity-60">×{count}</span>
									</Badge>
								))}
							</div>
						</section>
					)}
				</div>
			</div>
		</div>
	);
}
