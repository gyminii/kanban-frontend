"use client";

import KanbanCanvas from "@/components/kanban/canvas";
import { Badge } from "@/components/ui/badge";
import { useBoardDnd } from "@/hooks/use-board-dnd";
import { formatDate } from "@/utils/format-date";
import { NewColumnButton } from "../new-column-button";

export default function BoardView() {
	const { board, onDragEnd, refetchBoard } = useBoardDnd();
	const totalCards = board.columns.reduce((n, c) => n + c.cards.length, 0);
	return (
		<div className="flex h-full flex-col p-4">
			{/* Header */}
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-indigo-700 dark:text-indigo-400">
						{board.title}
					</h1>
					<div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
						<MetaBadge label="Owner" value={board.ownerId.slice(0, 8)} />
						<MetaBadge label="Members" value={String(board.members.length)} />
						<MetaBadge label="Columns" value={String(board.columns.length)} />
						<MetaBadge label="Cards" value={String(totalCards)} />
						<MetaBadge label="Updated" value={formatDate(board.updatedAt)} />
					</div>
				</div>
				<NewColumnButton boardId={board.id} />
			</div>

			{/* Canvas */}
			<div className="flex-1 min-h-0">
				<KanbanCanvas columns={board.columns ?? []} onDragEnd={onDragEnd} />
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
