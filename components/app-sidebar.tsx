"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
} from "@/components/ui/sidebar";
import { DatePicker } from "./date-picker";
import { UserProfile } from "./sidebar/user-profile";
import { Suspense } from "react";
import { BoardsList } from "./sidebar/board-list";
import { LoadingSpinner } from "./ui/spinner";
import Link from "next/link";
import { Button } from "./ui/button";
import { HelpCircle } from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar {...props}>
			<SidebarHeader className="border-sidebar-border border-b h-16">
				<Suspense fallback={<LoadingSpinner />}>
					<UserProfile />
				</Suspense>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<DatePicker />
				</SidebarGroup>
				<SidebarGroup>
					<Suspense fallback={<LoadingSpinner />}>
						<BoardsList />
					</Suspense>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="mt-auto border-t border-sidebar-border p-2">
				<Link href="/contact" className="w-full">
					<Button
						variant="outline"
						className="w-full flex items-center justify-center gap-2 text-indigo-500 hover:text-indigo-600"
					>
						<HelpCircle className="h-4 w-4" />
						Need Help?
					</Button>
				</Link>
			</SidebarFooter>
		</Sidebar>
	);
}
