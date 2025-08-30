"use client";

import React, { createContext, useContext } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { BOARD_QUERY } from "@/graphql/board";
import type { BoardT, ColumnT, CardT } from "@/components/kanban/types";

type BreadcrumbContextType = {
	board?: BoardT;
	column?: ColumnT;
	card?: CardT;
};

const BreadcrumbContext = createContext<BreadcrumbContextType>({});

export function BreadcrumbProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const params = useParams<{ boardId: string }>();
	const search = useSearchParams();

	const boardId = params?.boardId;
	const columnId = search?.get("column");
	const cardId = search?.get("card");

	const { data } = useQuery<{ board: BoardT }>(BOARD_QUERY, {
		variables: { boardId },
		skip: !boardId,
	});

	const board = data?.board;
	const column = board?.columns.find((c) => c.id === columnId);
	const card = column?.cards.find((x) => x.id === cardId);

	return (
		<BreadcrumbContext.Provider value={{ board, column, card }}>
			{children}
		</BreadcrumbContext.Provider>
	);
}

export const useBreadcrumbs = () => useContext(BreadcrumbContext);
