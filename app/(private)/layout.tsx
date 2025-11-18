import SidebarProvider from "@/components/sidebar/sidebar-provider";

export default async function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<SidebarProvider>
			<div className="flex flex-1 min-h-0 flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
				{children}
			</div>
		</SidebarProvider>
	);
}
