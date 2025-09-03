import BoardView from "@/components/kanban/board-view";
import { BoardT } from "@/components/kanban/types";
import { BOARD_QUERY } from "@/graphql/board";
import { getClient } from "@/utils/apollo/server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

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
		console.log(data);
		if (!user) redirect("/login");
		if (!data?.board) redirect("/dashboard");

		return <BoardView />;
	} catch (error) {
		console.error("An error occurred:", error);
		redirect("/dashboard");
	}
}
