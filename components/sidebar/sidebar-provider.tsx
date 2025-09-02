"use client";

import { Separator } from "@/components/ui/separator";
import {
	SidebarProvider as AppSidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { BreadcrumbProvider } from "@/utils/breadcrumbs/breadcrumbs-provider";
import { useSettings } from "@/utils/settings/provider";
import { AppBreadcrumbs } from "../app-breadcrumbs";
import { AppSidebar } from "../app-sidebar";
import { ThemeToggle } from "../theme-toggle";

export default function SidebarProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const {
		settings: { isSidebarOpen },
		update,
	} = useSettings();

	return (
		<AppSidebarProvider
			open={isSidebarOpen}
			onOpenChange={(open: boolean) => update({ isSidebarOpen: open })}
			style={
				{
					"--sidebar-width": "19rem",
				} as React.CSSProperties
			}
		>
			<AppSidebar />
			{/* sm:overflow-hidden */}
			<SidebarInset className="h-full min-h-0 flex-col bg-muted/40">
				<header className="bg-background flex h-16 sticky top-0 shrink-0 items-center border-b px-4 z-50">
					<SidebarTrigger className="-ml-1" />
					<Separator
						orientation="vertical"
						className="mr-2 data-[orientation=vertical]:h-4"
					/>
					<BreadcrumbProvider>
						<AppBreadcrumbs />
					</BreadcrumbProvider>
					<div className="ml-auto">
						<ThemeToggle />
					</div>
				</header>
				{children}
			</SidebarInset>
		</AppSidebarProvider>
	);
}
