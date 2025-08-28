import { createClient } from "@/utils/supabase/server";
import { getClient } from "@/utils/apollo/server";
import { DASHBOARD_BOARDS } from "@/graphql/board";
import type { BoardT, CardT } from "@/components/kanban/types";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatDate(d?: string) {
	return d ? new Date(d).toLocaleDateString() : "";
}

export default async function DashboardPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) redirect("/login");

	const client = getClient();
	const { data } = await client.query<{ boards: BoardT[] }>({
		query: DASHBOARD_BOARDS,
		variables: { userId: user.id },
		fetchPolicy: "no-cache",
	});

	const boards = data?.boards ?? [];

	// Collect cards assigned to this user (with board metadata)
	const assigned: (CardT & { boardId: string; boardTitle: string })[] = [];
	for (const b of boards) {
		for (const col of b.columns) {
			for (const card of col.cards) {
				if (card.assignedTo === user.id) {
					assigned.push({ ...card, boardId: b.id, boardTitle: b.title });
				}
			}
		}
	}
	assigned.sort(
		(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
	);

	const displayName = user.user_metadata?.name || user.email || "Welcome back";

	return (
		<div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10 bg-muted/40">
			{/* Header: left-aligned date/name, right-aligned actions */}
			<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
				{/* Left */}
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
				</div>

				{/* Right */}
				<div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-2">
					<Badge
						variant="outline"
						className="rounded-full border-indigo-300/60 text-indigo-700 dark:border-indigo-900 dark:text-indigo-300"
					>
						My work
					</Badge>
					<Badge variant="outline" className="rounded-full">
						Completed {assigned.filter((c) => c.completed).length}
					</Badge>
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

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Left: My work */}
				<section className="lg:col-span-2 rounded-2xl border shadow-md bg-gradient-to-b from-indigo-50/40 to-background dark:from-indigo-950/20 dark:to-card">
					<div className="flex items-center justify-between px-4 py-3 border-b">
						<div className="flex items-center gap-2">
							<span className="text-sm font-semibold">My work</span>
							<Badge variant="secondary">{assigned.length}</Badge>
						</div>
						<div className="text-xs text-muted-foreground">
							Recently updated
						</div>
					</div>

					<div className="divide-y">
						{assigned.length === 0 ? (
							<div className="px-8 py-12 text-center text-sm text-muted-foreground">
								No tasks are assigned to you. Ask a teammate to assign you a
								card, or create a project and start planning.
								<div className="mt-4">
									<Button asChild>
										<Link href="/create-project">Create project</Link>
									</Button>
								</div>
							</div>
						) : (
							assigned.slice(0, 12).map((card) => (
								<div
									key={card.id}
									className="px-4 py-3 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
								>
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2">
												<Link
													href={`/boards/${card.boardId}`}
													className="text-xs text-indigo-600 dark:text-indigo-300 hover:underline truncate"
													title={card.boardTitle}
												>
													{card.boardTitle}
												</Link>
												{card.dueDate ? (
													<Badge variant="outline" className="h-5 rounded-full">
														Due {formatDate(card.dueDate)}
													</Badge>
												) : null}
												{card.completed ? (
													<Badge
														variant="secondary"
														className="h-5 rounded-full"
													>
														Done
													</Badge>
												) : (
													<Badge className="h-5 rounded-full bg-indigo-600 text-white">
														Open
													</Badge>
												)}
											</div>
											<div className="mt-1 font-medium truncate">
												{card.title}
											</div>
											{card.description ? (
												<div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
													{card.description}
												</div>
											) : null}
										</div>

										<div className="shrink-0 text-right text-xs text-muted-foreground">
											<div>{formatDate(card.updatedAt)}</div>
											<div className="opacity-70">#{card.id.slice(-6)}</div>
										</div>
									</div>
								</div>
							))
						)}
					</div>

					{assigned.length > 12 ? (
						<div className="border-t px-4 py-3 text-right">
							<Button variant="ghost" size="sm" asChild>
								<Link href="/tasks">View all tasks</Link>
							</Button>
						</div>
					) : null}
				</section>

				{/* Right: Projects */}
				<section className="rounded-2xl border shadow-md bg-gradient-to-b from-background to-indigo-50/40 dark:from-card dark:to-indigo-950/20">
					<div className="flex items-center justify-between px-4 py-3 border-b">
						<div className="flex items-center gap-2">
							<span className="text-sm font-semibold">Projects</span>
							<Badge variant="secondary">{boards.length}</Badge>
						</div>
						<Button variant="outline" size="sm" asChild>
							<Link href="/boards/create">Create</Link>
						</Button>
					</div>

					<div className="p-3 grid gap-3">
						{boards.length === 0 ? (
							<div className="px-2 py-8 text-center text-sm text-muted-foreground">
								You have no projects yet.
							</div>
						) : (
							boards.slice(0, 8).map((b) => {
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

					{boards.length > 8 ? (
						<div className="border-t px-4 py-3 text-right">
							<Button variant="ghost" size="sm" asChild>
								<Link href="/boards">View all projects</Link>
							</Button>
						</div>
					) : null}
				</section>
			</div>
		</div>
	);
}
