"use client";

import * as React from "react";
import type { DropResult } from "@hello-pangea/dnd";
import { useApolloClient } from "@apollo/client/react";
import { BOARD_QUERY } from "@/graphql/board";
import { MOVE_COLUMN } from "@/graphql/column";
import { MOVE_CARD } from "@/graphql/card";
import type { BoardT, ColumnT, CardT } from "@/components/kanban/types";

export function useBoardDnd(
	board: BoardT | undefined,
	setBoard: (b: BoardT) => void
) {
	const client = useApolloClient();

	const boardRef = React.useRef<BoardT | undefined>(board);
	React.useEffect(() => {
		boardRef.current = board;
	}, [board]);

	const refetchBoard = async (id: string) => {
		await client.query({
			query: BOARD_QUERY,
			variables: { boardId: id },
			fetchPolicy: "no-cache",
		});
	};

	const onDragEnd = async (result: DropResult) => {
		const current = boardRef.current;
		if (!current || !current.columns) return;

		const { source, destination, type, draggableId } = result;
		if (!destination) return;

		// Columns
		if (type === "COLUMN") {
			const cols = [...current.columns].sort((a, b) => a.order - b.order);
			const [moved] = cols.splice(source.index, 1);
			cols.splice(destination.index, 0, moved);

			const reindexed: ColumnT[] = cols.map((c, i) => ({ ...c, order: i }));
			setBoard({ ...current, columns: reindexed });

			try {
				await client.mutate({
					mutation: MOVE_COLUMN,
					variables: { columnId: moved.id, newOrder: destination.index },
					optimisticResponse: {
						moveColumn: {
							__typename: "Column",
							id: moved.id,
							boardId: current.id,
							title: moved.title,
							order: destination.index,
							cards: moved.cards ?? [],
						} satisfies ColumnT & { __typename: "Column" },
					},
				});
			} catch {
				await refetchBoard(current.id);
			}
			return;
		}

		// Cards
		if (type === "CARD") {
			const fromId = source.droppableId;
			const toId = destination.droppableId;
			const cardId = draggableId.replace(/^card-/, "");

			const nextCols: ColumnT[] = current.columns.map((c) => ({
				...c,
				cards: [...c.cards],
			}));
			const fromCol = nextCols.find((c) => c.id === fromId);
			const toCol = nextCols.find((c) => c.id === toId);
			if (!fromCol || !toCol) return;

			const fromIdx = fromCol.cards.findIndex((c) => c.id === cardId);
			if (fromIdx < 0) return;

			const [movedCard] = fromCol.cards.splice(fromIdx, 1);
			const insertAt = Math.min(
				Math.max(destination.index, 0),
				toCol.cards.length
			);
			toCol.cards.splice(insertAt, 0, movedCard);

			const normalized: ColumnT[] = nextCols.map((c) => ({
				...c,
				cards: c.cards.map(
					(x, i): CardT => ({ ...x, order: i, columnId: c.id })
				),
			}));

			setBoard({ ...current, columns: normalized });

			try {
				await client.mutate({
					mutation: MOVE_CARD,
					variables: { cardId, newColumnId: toId, newOrder: insertAt },
					optimisticResponse: {
						moveCard: {
							__typename: "Card",
							id: movedCard.id,
							columnId: toId,
							order: insertAt,
							title: movedCard.title,
							description: movedCard.description ?? null,
							assignedTo: movedCard.assignedTo ?? null,
							createdAt: movedCard.createdAt ?? new Date().toISOString(),
							updatedAt: new Date().toISOString(),
							dueDate: movedCard.dueDate ?? null,
							completed: movedCard.completed ?? false,
						} satisfies CardT & { __typename: "Card" },
					},
				});
			} catch {
				await refetchBoard(current.id);
			}
		}
	};

	return { onDragEnd };
}
