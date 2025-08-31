"use client";

import { Separator } from "@/components/ui/separator";
import {
	SidebarProvider as AppSidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { BreadcrumbProvider } from "@/utils/breadcrumbs/breadcrumbs-provider";
import { useSettings } from "@/utils/settings/provider";
import * as React from "react";
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
			onOpenChange={(open: boolean) => {
				void update({ isSidebarOpen: open });
			}}
			style={
				{
					"--sidebar-width": "19rem",
				} as React.CSSProperties
			}
		>
			<AppSidebar />
			<SidebarInset className="h-dvh flex-col overflow-hidden">
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
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
