import SidebarProvider from "@/components/sidebar/sidebar-provider";
import { ApolloProvider } from "@/utils/apollo/provider";
import { Toaster } from "sonner";

export default async function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ApolloProvider>
			<SidebarProvider>
				{/* flex flex-1 min-w-0 min-h-0 flex-col gap-4 p-4 pt-0 overflow-hidden */}
				{/* flex flex-1 flex-col gap-4 p-4 pt-0 */}
				<div className="flex flex-1  flex-col gap-4 p-4 pt-0 overflow-hidden">
					{children}
					<Toaster />
				</div>
			</SidebarProvider>
		</ApolloProvider>
	);
}
