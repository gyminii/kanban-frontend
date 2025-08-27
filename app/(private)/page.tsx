import { BOARDS_QUERY } from "@/graphql/board";
import { getClient } from "@/utils/apollo/server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Page() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	const client = getClient();

	if (!user) redirect("/login");

	const { data } = await client.query<{ boards: { id: string }[] }>({
		query: BOARDS_QUERY,
		variables: { userId: user.id }, // <-- camelCase
		fetchPolicy: "no-cache",
	});
	if (!data?.boards || data.boards.length === 0) {
		redirect("/create-project");
	}
	return redirect("/dashboard");
}
