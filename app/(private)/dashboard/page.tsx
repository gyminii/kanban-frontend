import DueSoonSection from "@/components/dashboard/due-soon-section";
import FavoritesSection from "@/components/dashboard/favorites-section";
import ProjectsSection from "@/components/dashboard/projects-section";
import TagCloudSection from "@/components/dashboard/tag-cloud-section";
import TasksSection from "@/components/dashboard/tasks-section";
import type { BoardT, ColumnT } from "@/components/kanban/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DASHBOARD_BOARDS } from "@/graphql/board";
import { getClient } from "@/utils/apollo/server";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, TrendingUp, Clock, Zap } from "lucide-react";

export default async function DashboardPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) redirect("/login");

	const client = getClient();

	const { data: boardsData } = await client.query<{ boards: BoardT[] }>({
		query: DASHBOARD_BOARDS,
		variables: { userId: user.id },
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

	console.log(boards);
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

	// Calculate some quick stats
	const totalTasks = boards.reduce(
		(acc, board) =>
			acc + board.columns.reduce((colAcc, col) => colAcc + col.cards.length, 0),
		0
	);
	const completedTasks = boards.reduce(
		(acc, board) =>
			acc +
			board.columns.reduce(
				(colAcc, col) =>
					colAcc + col.cards.filter((card) => card.completed).length,
				0
			),
		0
	);
	console.log(completedTasks);

	return (
		<div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10 ">
			{/* Decorated Header */}
			<div className="relative mb-8  bg-card/60 backdrop-blur-sm overflow-hidden rounded-2xl border shadow-lg bg-gradient-to-b from-indigo-50/40 to-background dark:from-indigo-950/20 dark:to-card">
				<div className="relative p-6 sm:p-8">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div className="flex-1">
							{/* Date with icon */}
							<div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
								<Calendar className="h-4 w-4 text-indigo-500" />
								{new Date().toLocaleDateString(undefined, {
									weekday: "long",
									month: "long",
									day: "numeric",
								})}
							</div>

							{/* Main title */}
							<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
								{displayName}
							</h1>

							{/* Stats row */}
							<div className="mt-4 flex flex-wrap items-center gap-3">
								<Badge
									variant="outline"
									className="rounded-full border-indigo-200 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300"
								>
									<TrendingUp className="mr-1 h-3 w-3" />
									{boards.length} Projects
								</Badge>
								<Badge
									variant="outline"
									className="rounded-full border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300"
								>
									<Zap className="mr-1 h-3 w-3" />
									{totalTasks} Tasks
								</Badge>
								{upcomingCards.length > 0 && (
									<Badge
										variant="outline"
										className="rounded-full border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300"
									>
										<Clock className="mr-1 h-3 w-3" />
										{upcomingCards.length} Due Soon
									</Badge>
								)}
							</div>
						</div>

						{/* Action buttons */}
						<div className="mt-6 sm:mt-0 flex flex-wrap items-center gap-3">
							<div className="hidden sm:block text-right">
								<p className="text-xs text-muted-foreground">Quick Start</p>
								<p className="text-xs text-muted-foreground">
									Ready to organize?
								</p>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="border-indigo-300/60 bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-950/80 dark:border-indigo-700/60"
								asChild
							>
								<Link href="/create-project">Create Project</Link>
							</Button>
						</div>
					</div>

					{/* Bottom decorative strip */}
					<div className="mt-6 pt-4 border-t border-border/50">
						<div className="flex items-center justify-between text-xs text-muted-foreground">
							<div className="flex items-center gap-4">
								<span>Workspace Status: Active</span>
								<div className="flex items-center gap-1">
									<div className="h-2 w-2 rounded-full bg-green-500"></div>
									<span>All systems operational</span>
								</div>
							</div>
							<div className="hidden sm:block">
								Last updated:{" "}
								{new Date().toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
				{/* LEFT: My work + Favorites */}
				<div className="xl:col-span-2 space-y-6">
					{/* My work (client-side fetch & refetch on selection) */}
					<TasksSection />

					{/* Favorites */}
					<FavoritesSection favoriteBoards={favoriteBoards} />
					<DueSoonSection
						upcomingCards={upcomingCards}
						upcomingColumns={upcomingColumns}
					/>
				</div>

				{/* RIGHT: Due soon + Projects + Tag cloud */}
				<div className="space-y-6">
					<ProjectsSection recentBoards={recentBoards} />

					<TagCloudSection tagCloud={tagCloud} />
				</div>
			</div>
		</div>
	);
}
