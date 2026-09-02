import SidebarProvider from "@/components/sidebar/sidebar-provider";
import { DASHBOARD_BOARDS } from "@/graphql/board";
import { PreloadQuery } from "@/utils/apollo/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const { userId } = await auth();
	if (!userId) redirect("/login");

	return (
		<PreloadQuery query={DASHBOARD_BOARDS} variables={{ userId }}>
			<SidebarProvider>
				<div className="flex flex-1 min-h-0 flex-col bg-background">
					{children}
				</div>
			</SidebarProvider>
		</PreloadQuery>
	);
}
