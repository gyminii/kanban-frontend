import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BoardT, ColumnT, CardT } from "@/components/kanban/types";
import { initialDemoBoard, DEMO_BOARD_ID } from "./initial-data";

interface DemoState {
	board: BoardT;
	isDemo: boolean;
	setIsDemo: (value: boolean) => void;
	updateBoard: (board: BoardT) => void;
	addColumn: (title: string, description?: string) => ColumnT;
	updateColumn: (columnId: string, updates: Partial<ColumnT>) => void;
	deleteColumn: (columnId: string) => void;
	moveColumn: (columnId: string, newOrder: number) => void;
	addCard: (columnId: string, title: string, description?: string) => CardT;
	updateCard: (cardId: string, updates: Partial<CardT>) => void;
	deleteCard: (cardId: string) => void;
	moveCard: (cardId: string, targetColumnId: string, newOrder: number) => void;
	resetDemo: () => void;
}

export const useDemoStore = create<DemoState>()(
	persist(
		(set, get) => ({
			board: initialDemoBoard,
			isDemo: false,

			setIsDemo: (value: boolean) => {
				set({ isDemo: value });
			},

			updateBoard: (updatedBoard: BoardT) => {
				set({ board: updatedBoard });
			},

			addColumn: (title: string, description?: string): ColumnT => {
				const { board } = get();
				const newColumn: ColumnT = {
					__typename: "Column",
					id: `demo-column-${Date.now()}`,
					boardId: DEMO_BOARD_ID,
					title,
					description: description || null,
					order: board.columns.length,
					startDate: null,
					endDate: null,
					status: null,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					cards: [],
				};

				set({
					board: {
						...board,
						columns: [...board.columns, newColumn],
					},
				});

				return newColumn;
			},

			updateColumn: (columnId: string, updates: Partial<ColumnT>) => {
				const { board } = get();
				set({
					board: {
						...board,
						columns: board.columns.map((col) =>
							col.id === columnId
								? { ...col, ...updates, updatedAt: new Date().toISOString() }
								: col
						),
					},
				});
			},

			deleteColumn: (columnId: string) => {
				const { board } = get();
				set({
					board: {
						...board,
						columns: board.columns.filter((col) => col.id !== columnId),
					},
				});
			},

			moveColumn: (columnId: string, newOrder: number) => {
				const { board } = get();
				const columns = [...board.columns];
				const columnIndex = columns.findIndex((col) => col.id === columnId);
				if (columnIndex === -1) return;

				const [movedColumn] = columns.splice(columnIndex, 1);
				columns.splice(newOrder, 0, movedColumn);

				// Update order property for all columns
				const reorderedColumns = columns.map((col, index) => ({
					...col,
					order: index,
				}));

				set({
					board: {
						...board,
						columns: reorderedColumns,
					},
				});
			},

			addCard: (
				columnId: string,
				title: string,
				description?: string
			): CardT => {
				const { board } = get();
				const column = board.columns.find((col) => col.id === columnId);
				if (!column) throw new Error("Column not found");

				const newCard: CardT = {
					__typename: "Card",
					id: `demo-card-${Date.now()}`,
					columnId,
					boardId: DEMO_BOARD_ID,
					title,
					description: description || null,
					order: column.cards.length,
					assignedTo: null,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					dueDate: null,
					completed: false,
					tags: [],
				};

				set({
					board: {
						...board,
						columns: board.columns.map((col) =>
							col.id === columnId
								? { ...col, cards: [...col.cards, newCard] }
								: col
						),
					},
				});

				return newCard;
			},

			updateCard: (cardId: string, updates: Partial<CardT>) => {
				const { board } = get();
				set({
					board: {
						...board,
						columns: board.columns.map((col) => ({
							...col,
							cards: col.cards.map((card) =>
								card.id === cardId
									? { ...card, ...updates, updatedAt: new Date().toISOString() }
									: card
							),
						})),
					},
				});
			},

			deleteCard: (cardId: string) => {
				const { board } = get();
				set({
					board: {
						...board,
						columns: board.columns.map((col) => ({
							...col,
							cards: col.cards.filter((card) => card.id !== cardId),
						})),
					},
				});
			},

			moveCard: (
				cardId: string,
				targetColumnId: string,
				newOrder: number
			) => {
				const { board } = get();
				// Find the card and source column
				let card: CardT | undefined;
				let sourceColumnId: string | undefined;

				for (const col of board.columns) {
					const foundCard = col.cards.find((c) => c.id === cardId);
					if (foundCard) {
						card = foundCard;
						sourceColumnId = col.id;
						break;
					}
				}

				if (!card || !sourceColumnId) return;

				// Remove card from source column
				const updatedColumns = board.columns.map((col) => {
					if (col.id === sourceColumnId) {
						return {
							...col,
							cards: col.cards.filter((c) => c.id !== cardId),
						};
					}
					return col;
				});

				// Add card to target column
				const finalColumns = updatedColumns.map((col) => {
					if (col.id === targetColumnId) {
						const newCards = [...col.cards];
						const updatedCard = { ...card!, columnId: targetColumnId };
						newCards.splice(newOrder, 0, updatedCard);

						// Update order for all cards in this column
						return {
							...col,
							cards: newCards.map((c, index) => ({ ...c, order: index })),
						};
					}
					return col;
				});

				set({
					board: {
						...board,
						columns: finalColumns,
					},
				});
			},

			resetDemo: () => {
				set({ board: initialDemoBoard });
			},
		}),
		{
			name: "kanban-demo-board",
		}
	)
);
