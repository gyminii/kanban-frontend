// hooks/use-sample.ts
"use client";

import * as React from "react";
import type { DropResult } from "@hello-pangea/dnd";
import { useParams } from "next/navigation";
import { useApolloClient, useSuspenseQuery } from "@apollo/client/react";
import { BOARD_QUERY } from "@/graphql/board";
import { MOVE_COLUMN } from "@/graphql/column";
import { MOVE_CARD } from "@/graphql/card";

import type { BoardT, ColumnT, CardT } from "@/components/kanban/types";

type QueryData = { board: BoardT };

export function useSample() {
	const params = useParams<{ boardId: string | string[] }>();
	const rawBoardId = params?.boardId;
	const boardId = Array.isArray(rawBoardId) ? rawBoardId[0] : rawBoardId;

	const client = useApolloClient();

	// Source of truth = Apollo cache (populated here)
	const { data } = useSuspenseQuery<QueryData>(BOARD_QUERY, {
		variables: { boardId },
	});

	const board = data.board;

	// Keep a ref so DnD logic uses the latest snapshot
	const boardRef = React.useRef<BoardT>(board);
	React.useEffect(() => {
		boardRef.current = board;
	}, [board]);

	// Write the updated board back to Apollo (no local state)
	const writeBoard = React.useCallback(
		(next: BoardT) => {
			client.writeQuery<QueryData>({
				query: BOARD_QUERY,
				variables: { boardId },
				data: { board: next },
			});
			// update ref synchronously for the next DnD event
			boardRef.current = next;
		},
		[client, boardId]
	);

	const refetchBoard = React.useCallback(async () => {
		await client.query<QueryData>({
			query: BOARD_QUERY,
			variables: { boardId },
			fetchPolicy: "network-only",
		});
	}, [client, boardId]);

	const onDragEnd = React.useCallback(
		async (result: DropResult) => {
			const current = boardRef.current;
			if (!current?.columns) return;

			const { source, destination, type, draggableId } = result;
			if (!destination) return;
			if (
				source.droppableId === destination.droppableId &&
				source.index === destination.index
			) {
				return; // no move
			}

			// --- COLUMNS ---
			if (type === "COLUMN") {
				const movedId = draggableId.replace(/^col-/, "");
				const ordered = [...current.columns].sort((a, b) => a.order - b.order);
				const fromIdx = ordered.findIndex((c) => c.id === movedId);
				if (fromIdx < 0) return;

				const moved = ordered[fromIdx];
				const without = ordered.filter((c) => c.id !== moved.id);
				const newCols = [
					...without.slice(0, destination.index),
					moved,
					...without.slice(destination.index),
				];
				const reindexed = newCols.map((c, i) => ({ ...c, order: i }));
				writeBoard({ ...current, columns: reindexed });

				try {
					await client.mutate<{ moveColumn: ColumnT }>({
						mutation: MOVE_COLUMN,
						variables: { columnId: moved.id, newOrder: destination.index },
					});
				} catch {
					await refetchBoard();
				}
				return;
			}

			// --- CARDS ---
			if (type === "CARD") {
				const fromId = source.droppableId;
				const toId = destination.droppableId;
				const movedId = draggableId.replace(/^card-/, "");

				const nextCols: ColumnT[] = current.columns.map((c) => ({
					...c,
					cards: c.cards.map((card) => ({ ...card })),
				}));

				const fromCol = nextCols.find((c) => c.id === fromId);
				const toCol = nextCols.find((c) => c.id === toId);
				if (!fromCol || !toCol) return;

				const fromIdx = fromCol.cards.findIndex((c) => c.id === movedId);
				if (fromIdx < 0) return;

				const movedCard = fromCol.cards[fromIdx];

				const removed = fromCol.cards.filter((_, i) => i !== fromIdx);
				const baseDest = fromId === toId ? removed : toCol.cards;
				const targetIndex = Math.max(
					0,
					Math.min(destination.index, baseDest.length)
				);

				const inserted = [
					...baseDest.slice(0, targetIndex),
					movedCard,
					...baseDest.slice(targetIndex),
				];

				const normalized = nextCols.map((c) => {
					if (c.id === fromId && fromId !== toId) {
						return { ...c, cards: removed.map((x, i) => ({ ...x, order: i })) };
					}
					if (c.id === toId) {
						return {
							...c,
							cards: inserted.map((x, i) => ({
								...x,
								order: i,
								columnId: toId,
							})),
						};
					}
					if (c.id === fromId && fromId === toId) {
						return {
							...c,
							cards: inserted.map((x, i) => ({ ...x, order: i })),
						};
					}
					return c;
				});

				writeBoard({ ...current, columns: normalized });

				try {
					await client.mutate<{ moveCard: CardT }>({
						mutation: MOVE_CARD,
						variables: {
							cardId: movedCard.id,
							newColumnId: toId,
							newOrder: targetIndex,
						},
					});
				} catch {
					await refetchBoard();
				}
			}
		},
		[client, refetchBoard, writeBoard]
	);

	return { board, onDragEnd, refetchBoard };
}
