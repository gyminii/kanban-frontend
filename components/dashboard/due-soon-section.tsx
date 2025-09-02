import Link from "next/link";
import { Badge } from "../ui/badge";
import { formatDate } from "@/utils/format-date";
import { CardT, ColumnT } from "../kanban/types";

function daysUntil(date: Date) {
	const start = new Date();
	start.setHours(0, 0, 0, 0);
	const end = new Date(date);
	end.setHours(0, 0, 0, 0);
	return Math.ceil((end.getTime() - start.getTime()) / 86400000);
}
export default function DueSoonSection({
	upcomingCards,
	upcomingColumns,
}: {
	upcomingCards: { card: CardT; boardId: string; boardTitle: string }[];
	upcomingColumns: {
		col: ColumnT;
		dueRaw: string;
		boardId: string;
		boardTitle: string;
	}[];
}) {
	return (
		<>
			{/* Due soon — Tasks */}
			<section className="rounded-2xl border shadow-md bg-gradient-to-b from-indigo-50/40 to-background dark:from-indigo-950/20 dark:to-card">
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
						upcomingCards.slice(0, 8).map(({ card, boardId, boardTitle }) => {
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
			<section className="rounded-2xl border shadow-md bg-gradient-to-b from-indigo-50/40 to-background dark:from-indigo-950/20 dark:to-card">
				<div className="flex items-center justify-between px-4 py-3 border-b">
					<div className="flex items-center gap-2">
						<span className="text-sm font-semibold">Due soon — Columns</span>
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
		</>
	);
}
