import BoardView from "@/components/kanban/board-view";
import { BoardT } from "@/components/kanban/types";
import { BOARD_QUERY } from "@/graphql/board";
import { getClient } from "@/utils/apollo/server";
import { createClient } from "@/utils/supabase/server";
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
			fetchPolicy: "no-cache",
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
	const client = getClient();
	const supabase = await createClient();
	try {
		const { data } = await client.query<{ board: BoardT }>({
			query: BOARD_QUERY,
			variables: { boardId },
			fetchPolicy: "no-cache",
		});

		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) redirect("/login");
		if (!data?.board) redirect("/dashboard");

		return <BoardView />;
	} catch (error) {
		console.error("An error occurred:", error);
		redirect("/dashboard");
	}
}
