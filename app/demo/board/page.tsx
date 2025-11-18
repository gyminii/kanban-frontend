import { Metadata } from "next";
import DemoBoardView from "@/components/kanban/demo-board-view";

export const metadata: Metadata = {
	title: "Demo Board - Try Kanban",
	description: "Try out the kanban board features without signing up",
};

export default function DemoBoardPage() {
	return <DemoBoardView />;
}
