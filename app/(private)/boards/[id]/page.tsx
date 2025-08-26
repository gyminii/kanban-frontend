import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getClient } from "@/utils/apollo/server";
import { BOARD_QUERY } from "@/graphql/board";
import BoardView from "@/components/kanban/board-view";
import type { BoardT } from "@/components/kanban/types";

export default async function BoardPage({
	params,
}: {
	params: { id: string };
}) {
	const { id } = await params;
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) redirect("/login");

	const client = getClient();
	const { data } = await client.query<{ board: BoardT }>({
		query: BOARD_QUERY,
		variables: { boardId: id },
		fetchPolicy: "no-cache",
	});

	if (!data?.board) redirect("/");

	// Pass plain JSON to the client component
	return <BoardView initialBoard={JSON.parse(JSON.stringify(data.board))} />;
}
