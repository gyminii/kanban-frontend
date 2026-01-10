import Link from "next/link";
import { BoardT } from "../kanban/types";
import { Badge } from "../ui/badge";

export default function FavoritesSection({
	favoriteBoards,
}: {
	favoriteBoards: BoardT[];
}) {
	if (favoriteBoards.length === 0) {
		return null;
	}
	return (
		<section className="rounded-xl border shadow-sm bg-card transition-all duration-200 hover:shadow-md">
			<div className="flex items-center justify-between px-4 py-3 border-b">
				<div className="flex items-center gap-2">
					<span className="text-sm font-semibold">Favorites</span>
					<Badge variant="secondary">{favoriteBoards.length}</Badge>
				</div>
			</div>
			<div className="grid gap-3 p-3 sm:grid-cols-2">
				{favoriteBoards.slice(0, 6).map((b) => {
					const cardCount = b.columns.reduce((n, c) => n + c.cards.length, 0);
					return (
						<Link
							key={b.id}
							href={`/boards/${b.id}`}
							className="group rounded-lg border px-3 py-2 hover:bg-secondary hover:border-primary/30 transition-all duration-200"
						>
							<div className="flex items-start justify-between gap-2">
								<div className="min-w-0">
									<div className="font-semibold truncate transition-colors duration-200 group-hover:text-primary">
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
									<Badge variant="outline" className="rounded-md">
										Columns {b.columns.length}
									</Badge>
									<Badge className="rounded-md bg-primary text-primary-foreground">
										Cards {cardCount}
									</Badge>
								</div>
							</div>
						</Link>
					);
				})}
			</div>
		</section>
	);
}
