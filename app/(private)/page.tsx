import { BOARDS_QUERY } from "@/graphql/board";
import { getClient } from "@/utils/apollo/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
	const { userId } = await auth();
	const client = getClient();

	if (!userId) redirect("/login");

	const { data } = await client.query<{ boards: { id: string }[] }>({
		query: BOARDS_QUERY,
		variables: { userId },
		fetchPolicy: "network-only",
	});
	if (!data?.boards || data.boards.length === 0) {
		redirect("/create-project");
	}
	return redirect("/dashboard");
}
