import BoardView from "@/components/kanban/board-view";
import { BoardT } from "@/components/kanban/types";
import { BOARD_QUERY } from "@/graphql/board";
import { getClient } from "@/utils/apollo/server";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

type Params = {
	boardId: string;
};

export async function generateMetadata({
	params,
}: {
	params: Promise<Params>;
}): Promise<Metadata> {
	const { boardId } = await params;
	const client = getClient();

	try {
		const { data } = await client.query<{ board: BoardT }>({
			query: BOARD_QUERY,
			variables: { boardId },
		});

		if (data?.board) {
			return {
				title: data.board.title ?? "Board",
				description: data.board.description ?? "Kanban board",
			};
		}
	} catch (e) {
		console.error("Metadata fetch failed", e);
	}

	return {
		title: "Board",
		description: "Kanban board",
	};
}

export default async function BoardPage({
	params,
}: {
	params: Promise<{ boardId: string }>;
}) {
	const { boardId } = await params;
	const { userId } = await auth();
	if (!userId) redirect("/login");

	const client = getClient();
	let board: BoardT | undefined;
	try {
		const { data } = await client.query<{ board: BoardT }>({
			query: BOARD_QUERY,
			variables: { boardId },
		});
		board = data?.board;
	} catch (error) {
		console.error("An error occurred:", error);
		redirect("/dashboard");
	}

	if (!board) redirect("/dashboard");

	return <BoardView />;
}
