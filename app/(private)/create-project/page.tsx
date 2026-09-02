import CreateBoardDialog from "@/components/dialogs/create-board-dialog";
import { auth } from "@clerk/nextjs/server";

export default async function CreateProjectPage() {
	const { userId } = await auth();

	if (!userId) return null;

	return <CreateBoardDialog />;
}
