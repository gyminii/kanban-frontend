// hooks/useBoardState.ts
"use client";

import * as React from "react";
import { useApolloClient } from "@apollo/client/react";
import { BOARD_QUERY } from "@/graphql/board";

export type CardT = {
	id: string;
	columnId: string;
	title: string;
	description?: string | null;
	order: number;
	assignedTo?: string | null;
	createdAt: string;
	updatedAt: string;
	dueDate?: string | null;
	completed: boolean;
};

export type ColumnT = {
	id: string;
	boardId: string;
	title: string;
	order: number;
	cards: CardT[];
};

export type BoardT = {
	id: string;
	title: string;
	ownerId: string;
	members: string[];
	createdAt: string;
	updatedAt: string;
	columns: ColumnT[];
};

export function useBoardState(initialBoard: BoardT) {
	const client = useApolloClient();
	const [board, setBoard] = React.useState<BoardT>(initialBoard);

	// reset if board changes
	React.useEffect(() => {
		setBoard(initialBoard);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialBoard.id]);

	const writeBoardCache = React.useCallback(
		(next: BoardT) => {
			client.writeQuery({
				query: BOARD_QUERY,
				variables: { boardId: next.id },
				data: { board: next },
			});
		},
		[client]
	);

	const setAndCache = React.useCallback(
		(updater: (prev: BoardT) => BoardT) => {
			setBoard((prev) => {
				const next = updater(prev);
				writeBoardCache(next);
				return next;
			});
		},
		[writeBoardCache]
	);

	return { board, setBoard, setAndCache };
}
