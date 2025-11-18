import { DemoProvider } from "@/utils/demo/context";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DemoLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<DemoProvider>
			<SidebarProvider>{children}</SidebarProvider>
		</DemoProvider>
	);
}
