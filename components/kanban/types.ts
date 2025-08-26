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
	title: string;
	boardId: string;
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
