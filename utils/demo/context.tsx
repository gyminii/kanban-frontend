"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { BoardT, ColumnT, CardT } from "@/components/kanban/types";
import { initialDemoBoard, DEMO_BOARD_ID } from "./initial-data";

const STORAGE_KEY = "kanban-demo-board";

interface DemoContextType {
	board: BoardT;
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

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
	const [board, setBoard] = useState<BoardT>(initialDemoBoard);
	const [isInitialized, setIsInitialized] = useState(false);

	// Load from localStorage on mount
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				setBoard(parsed);
			} catch (e) {
				console.error("Failed to parse demo board from localStorage", e);
			}
		}
		setIsInitialized(true);
	}, []);

	// Save to localStorage whenever board changes
	useEffect(() => {
		if (isInitialized) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
		}
	}, [board, isInitialized]);

	const updateBoard = (updatedBoard: BoardT) => {
		setBoard(updatedBoard);
	};

	const addColumn = (title: string, description?: string): ColumnT => {
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

		setBoard({
			...board,
			columns: [...board.columns, newColumn],
		});

		return newColumn;
	};

	const updateColumn = (columnId: string, updates: Partial<ColumnT>) => {
		setBoard({
			...board,
			columns: board.columns.map((col) =>
				col.id === columnId
					? { ...col, ...updates, updatedAt: new Date().toISOString() }
					: col
			),
		});
	};

	const deleteColumn = (columnId: string) => {
		setBoard({
			...board,
			columns: board.columns.filter((col) => col.id !== columnId),
		});
	};

	const moveColumn = (columnId: string, newOrder: number) => {
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

		setBoard({
			...board,
			columns: reorderedColumns,
		});
	};

	const addCard = (
		columnId: string,
		title: string,
		description?: string
	): CardT => {
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

		setBoard({
			...board,
			columns: board.columns.map((col) =>
				col.id === columnId
					? { ...col, cards: [...col.cards, newCard] }
					: col
			),
		});

		return newCard;
	};

	const updateCard = (cardId: string, updates: Partial<CardT>) => {
		setBoard({
			...board,
			columns: board.columns.map((col) => ({
				...col,
				cards: col.cards.map((card) =>
					card.id === cardId
						? { ...card, ...updates, updatedAt: new Date().toISOString() }
						: card
				),
			})),
		});
	};

	const deleteCard = (cardId: string) => {
		setBoard({
			...board,
			columns: board.columns.map((col) => ({
				...col,
				cards: col.cards.filter((card) => card.id !== cardId),
			})),
		});
	};

	const moveCard = (
		cardId: string,
		targetColumnId: string,
		newOrder: number
	) => {
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

		setBoard({
			...board,
			columns: finalColumns,
		});
	};

	const resetDemo = () => {
		setBoard(initialDemoBoard);
		localStorage.removeItem(STORAGE_KEY);
	};

	const value: DemoContextType = {
		board,
		updateBoard,
		addColumn,
		updateColumn,
		deleteColumn,
		moveColumn,
		addCard,
		updateCard,
		deleteCard,
		moveCard,
		resetDemo,
	};

	return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoContext() {
	const context = useContext(DemoContext);
	if (!context) {
		throw new Error("useDemoContext must be used within DemoProvider");
	}
	return context;
}
