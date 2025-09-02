import CreateBoardDialog from "@/components/dialogs/create-board-dialog";
import { createClient } from "@/utils/supabase/server";

export default async function CreateProjectPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return null;

	return <CreateBoardDialog />;
}
