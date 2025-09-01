import SidebarProvider from "@/components/sidebar/sidebar-provider";
import { ApolloProvider } from "@/utils/apollo/provider";
import { Toaster } from "sonner";

export default async function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ApolloProvider>
			<SidebarProvider>
				<div className="flex flex-1  flex-col gap-4 p-4 pt-0 overflow-hidden">
					{children}
					<Toaster
						expand
						toastOptions={{
							unstyled: true,
							classNames: {
								// Base box
								toast:
									"pointer-events-auto font-sans rounded-2xl border bg-card text-foreground shadow-md px-4 py-3 " +
									"flex items-center gap-3",
								// Icon + text
								icon:
									"inline-flex h-5 w-5 items-center justify-center rounded-full border " +
									"border-indigo-500 text-indigo-600 dark:text-indigo-400",
								title: "text-xs font-medium leading-none",
								description: "text-xs text-muted-foreground leading-snug",
								// Buttons
								actionButton:
									"ml-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline",
								closeButton:
									"ml-1 rounded-md p-1 text-muted-foreground hover:text-foreground",
								// Variants (border + text only; keep bg neutral)
								success: "border-indigo-500",
								warning: "border-amber-500 text-amber-700 dark:text-amber-300",
								error: "border-rose-500 text-rose-700 dark:text-rose-300",
								info: "border-sky-500 text-sky-700 dark:text-sky-300",
							},
						}}
					/>
				</div>
			</SidebarProvider>
		</ApolloProvider>
	);
}
