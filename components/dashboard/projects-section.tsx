import { formatDate } from "@/utils/format-date";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { BoardT } from "../kanban/types";
import { Button } from "../ui/button";

export default function ProjectsSection({
	recentBoards,
}: {
	recentBoards: BoardT[];
}) {
	return (
		<section className="rounded-2xl border shadow-md overflow-hidden max-w-full bg-gradient-to-b from-indigo-50/40 to-background dark:from-indigo-950/20 dark:to-card">
			<div className="flex items-center justify-between px-4 py-3 border-b">
				<div className="flex items-center gap-2">
					<span className="text-sm font-semibold">Projects</span>
					<Badge variant="secondary">{recentBoards.length}</Badge>
				</div>
				<Button variant="outline" size="sm" asChild>
					<Link href="/create-project">Create</Link>
				</Button>
			</div>

			<div className="p-3 grid gap-3">
				{recentBoards.length === 0 ? (
					<div className="px-2 py-8 text-center text-sm text-muted-foreground">
						You have no projects yet.
					</div>
				) : (
					recentBoards.slice(0, 8).map((b) => {
						const cardCount = b.columns.reduce((n, c) => n + c.cards.length, 0);
						return (
							<Link
								key={b.id}
								href={`/boards/${b.id}`}
								className="group rounded-xl border px-3 py-2 transition-colors hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 overflow-hidden"
							>
								{/* Grid prevents push/overflow */}
								<div className="grid grid-cols-[1fr_auto] items-start gap-3">
									{/* Left: title/meta */}
									<div className="min-w-0">
										<div className="font-medium truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
											{b.title}
										</div>
										<div className="mt-0.5 text-xs text-muted-foreground">
											Updated: {formatDate(b.updatedAt)}
										</div>

										{b.tags?.length ? (
											// Wrap so tags never get cut off
											<div className="mt-1 flex flex-wrap gap-1 pr-1">
												{b.tags.slice(0, 12).map((t) => (
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

									{/* Right: stack stats top-to-bottom, smaller pills */}
									<div className="flex flex-col items-end gap-1 shrink-0">
										<Badge
											variant="outline"
											className="rounded-full whitespace-nowrap text-[11px] h-6 px-2 py-0"
										>
											Columns {b.columns.length}
										</Badge>
										<Badge className="rounded-full whitespace-nowrap bg-indigo-600 text-white text-[11px] h-6 px-2 py-0">
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
	);
}
