// app/(private)/create-project/page.tsx
import { cookies } from "next/headers";
import { getClient } from "@/utils/apollo/server";
import { createClient } from "@/utils/supabase/server";
import CreateBoardDialog from "@/components/dialogs/create-board-dialog";

export default async function CreateProjectPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// If unauthenticated, you can redirect or render nothing
	if (!user) return null;

	// The dialog itself is a Client Component, always open.
	return <CreateBoardDialog userId={user.id} />;
}
