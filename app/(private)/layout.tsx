import SidebarProvider from "@/components/sidebar/sidebar-provider";

export default async function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<SidebarProvider>
			<div className="flex flex-1 min-h-0 flex-col bg-background">
				{children}
			</div>
		</SidebarProvider>
	);
}
