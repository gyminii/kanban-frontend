export type ISODate = string;

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
	description?: string | null;
	startDate?: ISODate | null;
	endDate?: ISODate | null;
	status?: string | null;
	createdAt: ISODate;
	updatedAt: ISODate;
	cards: CardT[];
};

export type BoardT = {
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
