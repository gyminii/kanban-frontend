export type ISODate = string;

export type CardT = {
	__typename?: "Card";
	id: string;
	columnId: string;
	boardId: string;
	title: string;
	description?: string | null;
	order: number;
	assignedTo?: string | null;
	createdAt: string;
	updatedAt: string;
	dueDate?: string | null;
	completed: boolean;
	tags?: string[];
};

export type ColumnT = {
	__typename?: "Column";
	id: string;
	boardId: string;
	title: string;
	order: number;
	description?: string | null;
	startDate?: ISODate | null;
	endDate?: ISODate | null;
	status?: string | null;
	createdAt: ISODate;
	updatedAt: ISODate;
	cards: CardT[];
};

export type BoardT = {
	__typename?: "Board";
	id: string;
	title: string;
	ownerId: string;
	members: string[];
	createdAt: string;
	updatedAt: string;

	description?: string | null;
	color?: string | null;
	isFavorite?: boolean;
	isArchived?: boolean;
	tags?: string[];

	columns: ColumnT[];
};
