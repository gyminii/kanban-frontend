import { SidebarProvider } from "@/components/ui/sidebar";

export default function DemoLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <SidebarProvider>{children}</SidebarProvider>;
}
