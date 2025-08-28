"use client";

import KanbanCanvas from "@/components/kanban/canvas";
import type { BoardT, CardT, ColumnT } from "@/components/kanban/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ADD_CARD } from "@/graphql/card";
import { ADD_COLUMN } from "@/graphql/column";
import { useBoardDnd } from "@/hooks/use-board-dnd";
import { formatDate } from "@/utils/format-date";
import { useApolloClient } from "@apollo/client/react";
import * as React from "react";
import { NewColumnButton } from "../new-column-button";

function MetaBadge({ label, value }: { label: string; value: string }) {
	return (
		<Badge variant="outline" className="gap-1">
			<span className="opacity-70">{label}:</span>
			<span className="font-medium">{value}</span>
		</Badge>
	);
}

export default function BoardView({ initialBoard }: { initialBoard: BoardT }) {
	const client = useApolloClient();
	const [board, setBoard] = React.useState<BoardT>(initialBoard);

	React.useEffect(() => setBoard(initialBoard), [initialBoard.id]);

	const { onDragEnd } = useBoardDnd(board, setBoard);

	const totalCards = board.columns.reduce((n, c) => n + c.cards.length, 0);

	async function onAddColumn() {
		const title = (window.prompt("Column title") ?? "").trim();
		if (!title) return;

		const { data } = await client.mutate<{ addColumn: ColumnT }>({
			mutation: ADD_COLUMN,
			variables: { boardId: board.id, title },
		});

		const newCol = data?.addColumn;
		if (!newCol) return;

		const withBoardId = { ...newCol, boardId: newCol.boardId ?? board.id };
		const cols = [...board.columns, withBoardId].map((c, i) => ({
			...c,
			order: i,
		}));
		setBoard({ ...board, columns: cols });
	}
	async function onAddCard(columnId: string) {
		const title = (window.prompt("Task title") ?? "").trim();
		if (!title) return;

		const { data } = await client.mutate<{ addCard: CardT }>({
			mutation: ADD_CARD,
			variables: { columnId, title, description: null },
		});

		const newCard = data?.addCard;
		if (!newCard) return;

		setBoard((prev) => ({
			...prev,
			columns: prev.columns.map((c) =>
				c.id === columnId ? { ...c, cards: [...c.cards, newCard] } : c
			),
		}));
	}

	return (
		<div className="flex h-full flex-col p-4">
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

			<div className="flex-1 min-h-0">
				<KanbanCanvas
					columns={board.columns ?? []}
					onDragEnd={onDragEnd}
					onAddCard={onAddCard}
				/>
			</div>
		</div>
	);
}
