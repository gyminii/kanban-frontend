"use client";
import { AudioWaveform, Command } from "lucide-react";
import * as React from "react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
} from "@/components/ui/sidebar";
import { BoardSwitcher } from "./board-switcher";
import { DatePicker } from "./date-picker";

// This is sample data.
const data = {
	teams: [
		{
			name: "Acme Inc",
			logo: Command,
			plan: "Enterprise",
		},
		{
			name: "Acme Corp.",
			logo: AudioWaveform,
			plan: "Startup",
		},
		{
			name: "Evil Corp.",
			logo: Command,
			plan: "Free",
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar {...props}>
			<SidebarHeader className="border-sidebar-border border-b h-16">
				<BoardSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<DatePicker />
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
