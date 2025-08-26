"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useApolloClient } from "@apollo/client/react";
import { BOARD_QUERY } from "@/graphql/board";
import { ADD_COLUMN } from "@/graphql/column";
import { ADD_CARD } from "@/graphql/card";
import KanbanCanvas from "@/components/kanban/canvas";
import { useBoardDnd } from "@/hooks/use-board-dnd";
import type { BoardT, ColumnT, CardT } from "@/components/kanban/types";

function MetaBadge({ label, value }: { label: string; value: string }) {
	return (
		<span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs border-indigo-200 text-indigo-700 dark:text-indigo-300 dark:border-indigo-900">
			<span className="opacity-70">{label}:</span>
			<span className="font-medium">{value}</span>
		</span>
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

		const cols = [...board.columns, newCol].map((c, i) => ({ ...c, order: i }));
		const next = { ...board, columns: cols };
		setBoard(next);
		client.writeQuery({
			query: BOARD_QUERY,
			variables: { boardId: board.id },
			data: { board: next },
		});
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

		setBoard((prev) => {
			const cols = prev.columns.map((c) => {
				if (c.id !== columnId) return c;
				return { ...c, cards: [...c.cards, { ...newCard }] };
			});
			const next = { ...prev, columns: cols };
			client.writeQuery({
				query: BOARD_QUERY,
				variables: { boardId: prev.id },
				data: { board: next },
			});
			return next;
		});
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
						<MetaBadge
							label="Updated"
							value={new Date(board.updatedAt).toLocaleDateString()}
						/>
					</div>
				</div>
				<Button
					onClick={onAddColumn}
					className="self-start sm:self-auto bg-indigo-600 hover:bg-indigo-700 text-white"
				>
					New Column
				</Button>
			</div>

			<div className="flex-1 min-h-0">
				<KanbanCanvas
					columns={board.columns}
					onDragEnd={onDragEnd}
					onAddCard={onAddCard}
				/>
			</div>
		</div>
	);
}
