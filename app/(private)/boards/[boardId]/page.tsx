import BoardView from "@/components/kanban/board-view";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function BoardPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) redirect("/login");

	return <BoardView />;
}
