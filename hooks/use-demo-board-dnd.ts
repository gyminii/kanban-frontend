"use client";

import type { DropResult } from "@hello-pangea/dnd";
import { useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

import { useDemoStore } from "@/utils/demo/store";
import type { BoardT } from "@/components/kanban/types";

export function useDemoBoardDnd() {
	const board = useDemoStore((state) => state.board);
	const moveColumn = useDemoStore((state) => state.moveColumn);
	const moveCard = useDemoStore((state) => state.moveCard);

	const boardRef = useRef<BoardT>(board);
	useEffect(() => {
		boardRef.current = board;
	}, [board]);

	const onDragEnd = useCallback(
		async (result: DropResult) => {
			const current = boardRef.current;
			if (!current?.columns) return;

			const { source, destination, type, draggableId } = result;
			if (!destination) return;
			if (
				source.droppableId === destination.droppableId &&
				source.index === destination.index
			) {
				return;
			}

			// --- Columns ---
			if (type === "COLUMN") {
				const movedId = draggableId.replace(/^col-/, "");
				moveColumn(movedId, destination.index);
				return;
			}

			// --- Cards ---
			if (type === "CARD") {
				const fromId = source.droppableId;
				const toId = destination.droppableId;
				const movedId = draggableId.replace(/^card-/, "");

				const fromCol = current.columns.find((c) => c.id === fromId);
				const toCol = current.columns.find((c) => c.id === toId);
				if (!fromCol || !toCol) return;

				const movedCard = fromCol.cards.find((c) => c.id === movedId);
				if (!movedCard) return;

				const baseDest =
					fromId === toId
						? fromCol.cards.filter((c) => c.id !== movedId)
						: toCol.cards;
				const targetIndex = Math.max(
					0,
					Math.min(destination.index, baseDest.length)
				);

				moveCard(movedId, toId, targetIndex);

				// Show toast with undo action for cross-column moves
				if (fromId !== toId) {
					const destTitle = toCol.title;
					const undoInfo = {
						cardId: movedId,
						fromId,
						toId,
						fromIndex: source.index,
					};

					toast.success(`Task moved to "${destTitle}".`, {
						action: {
							label: "Undo",
							onClick: () => {
								// Move card back to original position
								moveCard(undoInfo.cardId, undoInfo.fromId, undoInfo.fromIndex);
							},
						},
					});
				}
			}
		},
		[moveColumn, moveCard]
	);

	const refetchBoard = useCallback(async () => {
		// No-op for demo mode since we're using local state
	}, []);

	return { board, onDragEnd, refetchBoard };
}
