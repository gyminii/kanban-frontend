"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
} from "@/components/ui/sidebar";
import { DatePicker } from "./date-picker";
import { UserProfile } from "./user-profile";
import { Suspense } from "react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar {...props}>
			<SidebarHeader className="border-sidebar-border border-b h-16">
				<Suspense fallback={<div>Loading profile...</div>}>
					<UserProfile />
				</Suspense>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<DatePicker />
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
